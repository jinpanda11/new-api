package setting

// Waffo Pancake hosted checkout configuration. WaffoPancakeEnabled must be
// true AND credentials (MerchantID + PrivateKey + ProductID) must be set
// for the gateway to appear in the wallet. Mirroring WaffoEnabled.
var (
	WaffoPancakeEnabled    bool
	WaffoPancakeMerchantID string
	WaffoPancakePrivateKey string
	WaffoPancakeReturnURL  string
	WaffoPancakeUnitPrice  float64 = 1.0
	WaffoPancakeMinTopUp   int     = 1
	WaffoPancakeStoreID    string
	WaffoPancakeProductID  string
)
