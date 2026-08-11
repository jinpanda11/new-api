package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// 额度展示类型
const (
	QuotaDisplayTypeUSD    = "USD"
	QuotaDisplayTypeCNY    = "CNY"
	QuotaDisplayTypeTokens = "TOKENS"
	QuotaDisplayTypeCustom = "CUSTOM"

	InterfaceLanguageZhCN = "zhCN"
	InterfaceLanguageEn   = "en"
	InterfaceLanguageFr   = "fr"
	InterfaceLanguageRu   = "ru"
	InterfaceLanguageJa   = "ja"
	InterfaceLanguageVi   = "vi"
	InterfaceLanguageZhTW = "zhTW"

	// 站点默认主题：跟随系统 / 浅色 / 深色。仅对未手动选择过主题的
	// 访客生效（前端在无 `vite-ui-theme` cookie 时应用此配置）。
	DefaultThemeSystem = "system"
	DefaultThemeLight  = "light"
	DefaultThemeDark   = "dark"
)

type GeneralSetting struct {
	DocsLink            string `json:"docs_link"`
	PingIntervalEnabled bool   `json:"ping_interval_enabled"`
	PingIntervalSeconds int    `json:"ping_interval_seconds"`
	// 当前站点额度展示类型：USD / CNY / TOKENS
	QuotaDisplayType string `json:"quota_display_type"`
	// 自定义货币符号，用于 CUSTOM 展示类型
	CustomCurrencySymbol string `json:"custom_currency_symbol"`
	// 自定义货币与美元汇率（1 USD = X Custom）
	CustomCurrencyExchangeRate float64 `json:"custom_currency_exchange_rate"`
	// 网站默认界面语言，用户可以在个人设置中覆盖此项。
	InterfaceLanguage string `json:"interface_language"`
	// 网站默认主题（system / light / dark），用户手动切换后以前端 cookie 为准。
	DefaultTheme string `json:"default_theme"`
}

// 默认配置
var generalSetting = GeneralSetting{
	DocsLink:                   "https://docs.newapi.pro",
	PingIntervalEnabled:        false,
	PingIntervalSeconds:        60,
	QuotaDisplayType:           QuotaDisplayTypeUSD,
	CustomCurrencySymbol:       "¤",
	CustomCurrencyExchangeRate: 1.0,
	InterfaceLanguage:          InterfaceLanguageEn,
	DefaultTheme:               DefaultThemeSystem,
}

// IsSupportedDefaultTheme 校验站点默认主题取值。
func IsSupportedDefaultTheme(theme string) bool {
	switch theme {
	case DefaultThemeSystem, DefaultThemeLight, DefaultThemeDark:
		return true
	default:
		return false
	}
}

func init() {
	// 注册到全局配置管理器
	config.GlobalConfig.Register("general_setting", &generalSetting)
}

func GetGeneralSetting() *GeneralSetting {
	return &generalSetting
}

func IsSupportedInterfaceLanguage(language string) bool {
	switch language {
	case InterfaceLanguageZhCN, InterfaceLanguageEn, InterfaceLanguageFr,
		InterfaceLanguageRu, InterfaceLanguageJa, InterfaceLanguageVi, InterfaceLanguageZhTW:
		return true
	default:
		return false
	}
}

func GetInterfaceLanguage() string {
	if IsSupportedInterfaceLanguage(generalSetting.InterfaceLanguage) {
		return generalSetting.InterfaceLanguage
	}
	return InterfaceLanguageEn
}

// IsCurrencyDisplay 是否以货币形式展示（美元或人民币）
func IsCurrencyDisplay() bool {
	return generalSetting.QuotaDisplayType != QuotaDisplayTypeTokens
}

// IsCNYDisplay 是否以人民币展示
func IsCNYDisplay() bool {
	return generalSetting.QuotaDisplayType == QuotaDisplayTypeCNY
}

// GetQuotaDisplayType 返回额度展示类型
func GetQuotaDisplayType() string {
	return generalSetting.QuotaDisplayType
}

// GetCurrencySymbol 返回当前展示类型对应符号
func GetCurrencySymbol() string {
	switch generalSetting.QuotaDisplayType {
	case QuotaDisplayTypeUSD:
		return "$"
	case QuotaDisplayTypeCNY:
		return "¥"
	case QuotaDisplayTypeCustom:
		if generalSetting.CustomCurrencySymbol != "" {
			return generalSetting.CustomCurrencySymbol
		}
		return "¤"
	default:
		return ""
	}
}

// GetUsdToCurrencyRate 返回 1 USD = X <currency> 的 X（TOKENS 不适用）
func GetUsdToCurrencyRate(usdToCny float64) float64 {
	switch generalSetting.QuotaDisplayType {
	case QuotaDisplayTypeUSD:
		return 1
	case QuotaDisplayTypeCNY:
		return usdToCny
	case QuotaDisplayTypeCustom:
		if generalSetting.CustomCurrencyExchangeRate > 0 {
			return generalSetting.CustomCurrencyExchangeRate
		}
		return 1
	default:
		return 1
	}
}
