package service

import (
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBriefContent(t *testing.T) {
	assert.Equal(t, "hello", briefContent("  hello  ", 500))
	assert.Equal(t, "", briefContent("", 500))

	long := strings.Repeat("a", 200)
	out := briefContent(long, 100)
	assert.Equal(t, 101, len([]rune(out))) // 100 runes + ellipsis
	assert.True(t, strings.HasPrefix(out, strings.Repeat("a", 100)))
	assert.True(t, strings.HasSuffix(out, "…"))

	// HTML injection must be escaped, never rendered as markup.
	assert.Equal(t, "&lt;script&gt;alert(1)&lt;/script&gt;", briefContent("<script>alert(1)</script>", 500))
}

func TestTicketLink(t *testing.T) {
	orig := system_setting.ServerAddress
	defer func() { system_setting.ServerAddress = orig }()

	system_setting.ServerAddress = "https://example.com/"
	assert.Equal(t, "https://example.com/console/ticket/detail/42", ticketLink(42))

	system_setting.ServerAddress = ""
	assert.Equal(t, "", ticketLink(42))
}

func TestRenderAdminMail(t *testing.T) {
	ticket := &model.Ticket{
		Id:       7,
		Title:    "Can't login <b>urgent</b>",
		Content:  "help me",
		Category: model.TicketCategoryAccount,
		Priority: model.TicketPriorityHigh,
		Status:   model.TicketStatusOpen,
	}
	orig := system_setting.ServerAddress
	defer func() { system_setting.ServerAddress = orig }()
	system_setting.ServerAddress = "https://example.com/"

	subject, body := renderAdminMail(ticketEventCreated, ticket, nil)
	require.Contains(t, subject, common.SystemName)
	require.Contains(t, subject, "#7")
	require.Contains(t, subject, ticket.Title)
	assert.Contains(t, body, "有新的工单创建")
	// Raw title is escaped in the HTML body to prevent injection.
	assert.Contains(t, body, "&lt;b&gt;urgent&lt;/b&gt;")
	assert.NotContains(t, body, "<b>urgent</b>")
	assert.Contains(t, body, "https://example.com/console/ticket/detail/7")

	_, body = renderAdminMail(ticketEventUserReplied, ticket, map[string]string{"message": "<img src=x onerror=alert(1)>"})
	assert.Contains(t, body, "&lt;img src=x onerror=alert(1)&gt;")
}

func TestRenderUserMail(t *testing.T) {
	ticket := &model.Ticket{
		Id:     9,
		Title:  "Refund request",
		Status: model.TicketStatusResolved,
	}
	orig := system_setting.ServerAddress
	defer func() { system_setting.ServerAddress = orig }()
	system_setting.ServerAddress = "https://example.com"

	subject, body := renderUserMail(ticketEventAdminReplied, ticket, map[string]string{"message": "fixed!"})
	assert.Contains(t, subject, "#9")
	assert.Contains(t, body, "客服回复了你的工单")
	assert.Contains(t, body, "fixed!")
	assert.Contains(t, body, "https://example.com/console/ticket/detail/9")

	_, body = renderUserMail(ticketEventStatusChanged, ticket, nil)
	assert.Contains(t, body, "resolved")

	subject, _ = renderUserMail(ticketEventClosed, ticket, nil)
	assert.Contains(t, subject, "已关闭")

	subject, _ = renderUserMail(ticketEventReopened, ticket, nil)
	assert.Contains(t, subject, "已重开")
}
