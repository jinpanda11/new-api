package i18n

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/setting/operation_setting"
)

func TestGetLangFromContextUsesUserLanguageBeforeSiteDefault(t *testing.T) {
	previousLanguage := operation_setting.GetGeneralSetting().InterfaceLanguage
	operation_setting.GetGeneralSetting().InterfaceLanguage = operation_setting.InterfaceLanguageZhCN
	t.Cleanup(func() {
		operation_setting.GetGeneralSetting().InterfaceLanguage = previousLanguage
	})

	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	common.SetContextKey(ctx, constant.ContextKeyUserSetting, dto.UserSetting{
		Language: "zhTW",
	})

	assert.Equal(t, LangZhTW, GetLangFromContext(ctx))
}

func TestGetLangFromContextUsesSiteDefaultInsteadOfRequestHeader(t *testing.T) {
	previousLanguage := operation_setting.GetGeneralSetting().InterfaceLanguage
	operation_setting.GetGeneralSetting().InterfaceLanguage = operation_setting.InterfaceLanguageZhTW
	t.Cleanup(func() {
		operation_setting.GetGeneralSetting().InterfaceLanguage = previousLanguage
	})

	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Request = httptest.NewRequest("GET", "/", nil)
	ctx.Request.Header.Set("Accept-Language", "en-US,en;q=0.9")

	assert.Equal(t, LangZhTW, GetLangFromContext(ctx))
}

func TestNormalizeLangSupportsFrontendChineseCodes(t *testing.T) {
	assert.Equal(t, LangZhCN, normalizeLang("zhCN"))
	assert.Equal(t, LangZhTW, normalizeLang("zhTW"))
}
