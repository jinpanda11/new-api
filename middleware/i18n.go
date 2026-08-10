package middleware

import (
	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/i18n"
)

// I18n middleware detects and sets the language preference for the request
func I18n() gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := detectLanguage(c)
		c.Set(string(constant.ContextKeyLanguage), lang)
		c.Next()
	}
}

// detectLanguage returns the site-wide default. Authenticated requests are
// resolved later by i18n.GetLangFromContext, which gives user preferences priority.
func detectLanguage(c *gin.Context) string {
	return i18n.GetLangFromContext(nil)
}

// GetLanguage returns the current language from gin context
func GetLanguage(c *gin.Context) string {
	if lang := c.GetString(string(constant.ContextKeyLanguage)); lang != "" {
		return lang
	}
	return i18n.DefaultLang
}
