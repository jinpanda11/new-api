package operation_setting

import (
	"math"

	"github.com/QuantumNous/new-api/setting/config"
)

// RankingSetting 排行榜展示配置，仅影响排行榜页面的显示层。
type RankingSetting struct {
	// DisplayMultiplier 排行榜展示倍率，1 表示不放大；小于等于 0 按 1 处理。
	DisplayMultiplier float64 `json:"display_multiplier"`
}

var rankingSetting = RankingSetting{
	DisplayMultiplier: 1.0,
}

func init() {
	config.GlobalConfig.Register("ranking_setting", &rankingSetting)
}

// GetRankingDisplayMultiplier 安全返回展示倍率，防止配置异常值（0/负数/NaN/Inf）。
func GetRankingDisplayMultiplier() float64 {
	m := rankingSetting.DisplayMultiplier
	if math.IsNaN(m) || math.IsInf(m, 0) || m <= 0 {
		return 1.0
	}
	return m
}
