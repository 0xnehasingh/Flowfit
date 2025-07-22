import FungibleToken from 0x9a0766d93b6608b7
import MetadataViews from 0x631e88ae7f1d7c20

pub contract FlowFitToken: FungibleToken {
    
    // Total supply of FlowFit tokens in existence
    pub var totalSupply: UFix64
    
    // Maximum supply limit - 1 billion tokens
    pub let maxSupply: UFix64
    
    // Daily minting limits
    pub let dailyMintLimit: UFix64
    pub var dailyMinted: {String: UFix64}
    pub var lastMintDay: {String: UInt64}
    
    // Authorized minters (fitness contracts)
    access(contract) let authorizedMinters: {Address: Bool}
    
    // Sponsored contracts for gasless transactions
    access(contract) let sponsoredContracts: {Address: Bool}
    
    // Partner information for redemptions
    pub struct PartnerInfo {
        pub let wallet: Address
        pub let rate: UFix64
        pub let active: Bool
        pub let category: String
        
        init(wallet: Address, rate: UFix64, active: Bool, category: String) {
            self.wallet = wallet
            self.rate = rate
            self.active = active
            self.category = category
        }
    }
    
    // Partner registry
    access(contract) let partners: {String: PartnerInfo}
    
    // User redemption tracking
    access(contract) let userRedemptions: {Address: {String: UFix64}}
    
    // Events
    pub event TokensInitialized(initialSupply: UFix64)
    pub event TokensWithdrawn(amount: UFix64, from: Address?)
    pub event TokensDeposited(amount: UFix64, to: Address?)
    pub event WorkoutReward(user: Address, amount: UFix64, workoutType: String)
    pub event PartnerRedemption(user: Address, partnerId: String, tokens: UFix64, service: String)
    pub event MinterAuthorized(minter: Address)
    pub event MinterRevoked(minter: Address)
    pub event SponsoredContract(contractAddr: Address, sponsored: Bool)
    
    // Vault resource for holding tokens
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance, MetadataViews.Resolver {
        pub var balance: UFix64
        
        init(balance: UFix64) {
            self.balance = balance
        }
        
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }
        
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @FlowFitToken.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }
        
        pub fun getViews(): [Type] {
            return [Type<MetadataViews.FTView>(),
                    Type<MetadataViews.FTDisplay>(),
                    Type<MetadataViews.FTVaultData>()]
        }
        
        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.FTView>():
                    return MetadataViews.FTView(
                        ftDisplay: self.resolveView(Type<MetadataViews.FTDisplay>()) as! MetadataViews.FTDisplay?,
                        ftVaultData: self.resolveView(Type<MetadataViews.FTVaultData>()) as! MetadataViews.FTVaultData?
                    )
                case Type<MetadataViews.FTDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://flowfit.app/tokens/fft-logo.png"
                        ),
                        mediaType: "image/png"
                    )
                    let medias = MetadataViews.Medias([media])
                    return MetadataViews.FTDisplay(
                        name: "FlowFit Token",
                        symbol: "FFT",
                        description: "The native token of the FlowFit ecosystem. Earn FFT by completing fitness challenges and redeem with partners.",
                        externalURL: MetadataViews.ExternalURL("https://flowfit.app"),
                        logos: medias,
                        socials: {
                            "twitter": MetadataViews.ExternalURL("https://twitter.com/flowfit")
                        }
                    )
                case Type<MetadataViews.FTVaultData>():
                    return MetadataViews.FTVaultData(
                        storagePath: FlowFitToken.VaultStoragePath,
                        receiverPath: FlowFitToken.VaultPublicPath,
                        metadataPath: FlowFitToken.VaultPublicPath,
                        providerPath: /private/flowFitTokenVault,
                        receiverType: Type<&FlowFitToken.Vault{FungibleToken.Receiver}>(),
                        metadataType: Type<&FlowFitToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(),
                        providerType: Type<&FlowFitToken.Vault{FungibleToken.Provider}>(),
                        createEmptyVaultFunction: (fun (): @FlowFitToken.Vault {
                            return <-FlowFitToken.createEmptyVault()
                        })
                    )
            }
            return nil
        }
        
        destroy() {
            if self.balance > 0.0 {
                FlowFitToken.totalSupply = FlowFitToken.totalSupply - self.balance
            }
        }
    }
    
    // Minter resource for creating new tokens
    pub resource Minter {
        pub fun mintTokens(amount: UFix64, recipient: Address, workoutType: String) {
            pre {
                amount > 0.0: "Amount must be positive"
                FlowFitToken.totalSupply + amount <= FlowFitToken.maxSupply: "Would exceed max supply"
                FlowFitToken.authorizedMinters[recipient] == true: "Recipient must be authorized"
            }
            
            let currentDay = UInt64(getCurrentBlock().timestamp / 86400)
            let dayKey = recipient.toString()
            
            // Reset daily counter if new day
            if FlowFitToken.lastMintDay[dayKey] != currentDay {
                FlowFitToken.dailyMinted[dayKey] = 0.0
                FlowFitToken.lastMintDay[dayKey] = currentDay
            }
            
            let currentDailyMinted = FlowFitToken.dailyMinted[dayKey] ?? 0.0
            assert(currentDailyMinted + amount <= FlowFitToken.dailyMintLimit, message: "Daily mint limit exceeded")
            
            FlowFitToken.dailyMinted[dayKey] = currentDailyMinted + amount
            FlowFitToken.totalSupply = FlowFitToken.totalSupply + amount
            
            let recipientVault = getAccount(recipient)
                .getCapability(FlowFitToken.VaultPublicPath)!
                .borrow<&FlowFitToken.Vault{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference")
            
            recipientVault.deposit(from: <-create Vault(balance: amount))
            
            emit WorkoutReward(user: recipient, amount: amount, workoutType: workoutType)
        }
    }
    
    // Administrator resource for managing the contract
    pub resource Administrator {
        pub fun setMinterAuthorization(minter: Address, authorized: Bool) {
            FlowFitToken.authorizedMinters[minter] = authorized
            
            if authorized {
                emit MinterAuthorized(minter: minter)
            } else {
                emit MinterRevoked(minter: minter)
            }
        }
        
        pub fun setSponsoredContract(contractAddr: Address, sponsored: Bool) {
            FlowFitToken.sponsoredContracts[contractAddr] = sponsored
            emit SponsoredContract(contractAddr: contractAddr, sponsored: sponsored)
        }
        
        pub fun updatePartner(partnerId: String, wallet: Address, rate: UFix64, active: Bool, category: String) {
            let partnerInfo = PartnerInfo(
                wallet: wallet,
                rate: rate,
                active: active,
                category: category
            )
            FlowFitToken.partners[partnerId] = partnerInfo
        }
        
        pub fun createMinter(): @Minter {
            return <-create Minter()
        }
    }
    
    // Public paths
    pub let VaultStoragePath: StoragePath
    pub let VaultPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    pub let AdminStoragePath: StoragePath
    
    // Create empty vault
    pub fun createEmptyVault(): @Vault {
        return <-create Vault(balance: 0.0)
    }
    
    // Get partner info
    pub fun getPartnerInfo(partnerId: String): PartnerInfo? {
        return FlowFitToken.partners[partnerId]
    }
    
    // Check if contract is sponsored
    pub fun isSponsoredContract(contractAddr: Address): Bool {
        return FlowFitToken.sponsoredContracts[contractAddr] ?? false
    }
    
    // Get user redemptions with partner
    pub fun getUserRedemptions(user: Address, partnerId: String): UFix64 {
        return FlowFitToken.userRedemptions[user]?[partnerId] ?? 0.0
    }
    
    // Redeem tokens with partner
    pub fun redeemWithPartner(userVault: @FungibleToken.Vault, partnerId: String, service: String): @FungibleToken.Vault {
        pre {
            FlowFitToken.partners[partnerId] != nil: "Partner not found"
            FlowFitToken.partners[partnerId]!.active: "Partner not active"
        }
        
        let partner = FlowFitToken.partners[partnerId]!
        let vault <- userVault as! @FlowFitToken.Vault
        let amount = vault.balance
        let userAddr = vault.owner?.address ?? panic("No owner")
        
        // Transfer tokens to partner
        let partnerVault = getAccount(partner.wallet)
            .getCapability(FlowFitToken.VaultPublicPath)!
            .borrow<&FlowFitToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow partner vault")
        
        partnerVault.deposit(from: <-vault)
        
        // Track redemption
        if FlowFitToken.userRedemptions[userAddr] == nil {
            FlowFitToken.userRedemptions[userAddr] = {}
        }
        let currentRedemptions = FlowFitToken.userRedemptions[userAddr]![partnerId] ?? 0.0
        FlowFitToken.userRedemptions[userAddr]![partnerId] = currentRedemptions + amount
        
        emit PartnerRedemption(user: userAddr, partnerId: partnerId, tokens: amount, service: service)
        
        return <-create Vault(balance: 0.0)
    }
    
    init() {
        self.totalSupply = 10000000.0 // 10M initial supply
        self.maxSupply = 1000000000.0 // 1B max supply
        self.dailyMintLimit = 100000.0 // 100k daily limit
        self.dailyMinted = {}
        self.lastMintDay = {}
        self.authorizedMinters = {}
        self.sponsoredContracts = {}
        self.partners = {}
        self.userRedemptions = {}
        
        self.VaultStoragePath = /storage/flowFitTokenVault
        self.VaultPublicPath = /public/flowFitTokenVault
        self.MinterStoragePath = /storage/flowFitTokenMinter
        self.AdminStoragePath = /storage/flowFitTokenAdmin
        
        // Create the admin resource and save it
        let admin <- create Administrator()
        self.account.save(<-admin, to: self.AdminStoragePath)
        
        // Create a minter resource and save it
        let minter <- create Minter()
        self.account.save(<-minter, to: self.MinterStoragePath)
        
        // Create the initial vault with the total supply
        let vault <- create Vault(balance: self.totalSupply)
        self.account.save(<-vault, to: self.VaultStoragePath)
        
        // Create public capability for the vault
        self.account.link<&Vault{FungibleToken.Receiver}>(
            self.VaultPublicPath,
            target: self.VaultStoragePath
        )
        
        self.account.link<&Vault{FungibleToken.Balance, MetadataViews.Resolver}>(
            self.VaultPublicPath,
            target: self.VaultStoragePath
        )
        
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
} 