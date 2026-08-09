package service

import (
	"fmt"
	"html"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/system_setting"
)

type ticketEventType string

const (
	ticketEventCreated       ticketEventType = "created"
	ticketEventUserReplied   ticketEventType = "user_replied"
	ticketEventAdminReplied  ticketEventType = "admin_replied"
	ticketEventStatusChanged ticketEventType = "status_changed"
	ticketEventClosed        ticketEventType = "closed"
	ticketEventReopened      ticketEventType = "reopened"
)

// NotifyTicketEvent is the single entry point; callers should always use go NotifyTicketEvent(...)
func NotifyTicketEvent(evt ticketEventType, ticket *model.Ticket, extra map[string]string) {
	if !common.TicketEmailNotifyEnabled {
		return
	}
	if ticket == nil {
		return
	}

	switch evt {
	case ticketEventCreated, ticketEventUserReplied:
		notifyAdmins(evt, ticket, extra)
	case ticketEventAdminReplied:
		notifyTicketOwner(evt, ticket, extra)
	case ticketEventStatusChanged, ticketEventClosed, ticketEventReopened:
		if !common.TicketNotifyStatusChangeEnabled {
			return
		}
		notifyTicketOwner(evt, ticket, extra)
	}
}

func adminRecipients() []string {
	raw := strings.TrimSpace(common.TicketAdminNotifyEmails)
	if raw == "" {
		root := model.GetRootUser()
		if root != nil && root.Email != "" {
			return []string{root.Email}
		}
		return nil
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func notifyAdmins(evt ticketEventType, ticket *model.Ticket, extra map[string]string) {
	to := adminRecipients()
	if len(to) == 0 {
		common.SysLog("ticket notify: no admin recipient configured, skip")
		return
	}
	subject, body := renderAdminMail(evt, ticket, extra)
	for _, addr := range to {
		addr := addr
		if err := common.SendEmail(subject, addr, body); err != nil {
			common.SysError(fmt.Sprintf("ticket notify to admin %s failed: %v", addr, err))
		}
	}
}

func notifyTicketOwner(evt ticketEventType, ticket *model.Ticket, extra map[string]string) {
	user, err := model.GetUserById(ticket.UserId, false)
	if err != nil || user == nil || user.Email == "" {
		return
	}
	subject, body := renderUserMail(evt, ticket, extra)
	if err := common.SendEmail(subject, user.Email, body); err != nil {
		common.SysError(fmt.Sprintf("ticket notify to user %d failed: %v", user.Id, err))
	}
}

func ticketLink(id int) string {
	base := strings.TrimRight(system_setting.ServerAddress, "/")
	if base == "" {
		return ""
	}
	return fmt.Sprintf("%s/console/ticket/detail/%d", base, id)
}

func briefContent(s string, max int) string {
	s = strings.TrimSpace(s)
	if len([]rune(s)) > max {
		s = string([]rune(s)[:max]) + "…"
	}
	return html.EscapeString(s)
}

func renderAdminMail(evt ticketEventType, t *model.Ticket, extra map[string]string) (string, string) {
	title := html.EscapeString(t.Title)
	idStr := fmt.Sprintf("#%d", t.Id)
	var subject, headline, body string
	switch evt {
	case ticketEventCreated:
		subject = fmt.Sprintf("[%s 新工单 %s] %s", common.SystemName, idStr, t.Title)
		headline = "有新的工单创建"
		body = briefContent(t.Content, 500)
	case ticketEventUserReplied:
		subject = fmt.Sprintf("[%s 工单 %s 用户回复] %s", common.SystemName, idStr, t.Title)
		headline = "用户追加了回复"
		body = briefContent(extra["message"], 500)
	}
	link := ticketLink(t.Id)
	htmlBody := fmt.Sprintf(`
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#1f2937">
  <h3 style="margin:0 0 12px">%s</h3>
  <p><strong>标题：</strong>%s</p>
  <p><strong>分类：</strong>%s　<strong>优先级：</strong>%s　<strong>状态：</strong>%s</p>
  <div style="border-left:3px solid #6366f1;padding:8px 12px;background:#f9fafb;white-space:pre-wrap">%s</div>
  <p style="margin-top:16px"><a href="%s" style="background:#4f46e5;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none">查看工单</a></p>
</div>`,
		headline, title, t.Category, t.Priority, t.Status, body, link)
	return subject, htmlBody
}

func renderUserMail(evt ticketEventType, t *model.Ticket, extra map[string]string) (string, string) {
	title := html.EscapeString(t.Title)
	idStr := fmt.Sprintf("#%d", t.Id)
	var subject, headline, body string
	switch evt {
	case ticketEventAdminReplied:
		subject = fmt.Sprintf("[%s 工单 %s 已回复] %s", common.SystemName, idStr, t.Title)
		headline = "客服回复了你的工单"
		body = briefContent(extra["message"], 500)
	case ticketEventStatusChanged:
		subject = fmt.Sprintf("[%s 工单 %s 状态更新] %s", common.SystemName, idStr, t.Title)
		headline = fmt.Sprintf("工单状态已更新为 %s", t.Status)
	case ticketEventClosed:
		subject = fmt.Sprintf("[%s 工单 %s 已关闭] %s", common.SystemName, idStr, t.Title)
		headline = "工单已关闭"
	case ticketEventReopened:
		subject = fmt.Sprintf("[%s 工单 %s 已重开] %s", common.SystemName, idStr, t.Title)
		headline = "工单已重新开启"
	}
	link := ticketLink(t.Id)
	quote := ""
	if body != "" {
		quote = fmt.Sprintf(`<div style="border-left:3px solid #10b981;padding:8px 12px;background:#f9fafb;white-space:pre-wrap">%s</div>`, body)
	}
	htmlBody := fmt.Sprintf(`
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#1f2937">
  <h3 style="margin:0 0 12px">%s</h3>
  <p><strong>工单：</strong>%s（%s）</p>
  <p><strong>当前状态：</strong>%s</p>
  %s
  <p style="margin-top:16px"><a href="%s" style="background:#4f46e5;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none">前往查看</a></p>
  <p style="color:#9ca3af;font-size:12px;margin-top:24px">此邮件由系统自动发出，请勿直接回复。</p>
</div>`,
		headline, title, idStr, t.Status, quote, link)
	return subject, htmlBody
}
