package operation_setting

import (
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetRankingDisplayMultiplier_DefaultsToOne(t *testing.T) {
	orig := rankingSetting
	t.Cleanup(func() { rankingSetting = orig })

	rankingSetting = RankingSetting{DisplayMultiplier: 1.0}
	assert.Equal(t, 1.0, GetRankingDisplayMultiplier())
}

func TestGetRankingDisplayMultiplier_InvalidValuesFallBackToOne(t *testing.T) {
	orig := rankingSetting
	t.Cleanup(func() { rankingSetting = orig })

	for _, tc := range []struct {
		name  string
		value float64
	}{
		{name: "zero", value: 0},
		{name: "negative", value: -5},
		{name: "NaN", value: math.NaN()},
		{name: "positive infinity", value: math.Inf(1)},
		{name: "negative infinity", value: math.Inf(-1)},
	} {
		t.Run(tc.name, func(t *testing.T) {
			rankingSetting = RankingSetting{DisplayMultiplier: tc.value}
			assert.Equal(t, 1.0, GetRankingDisplayMultiplier())
		})
	}
}

func TestGetRankingDisplayMultiplier_ValidValueIsReturned(t *testing.T) {
	orig := rankingSetting
	t.Cleanup(func() { rankingSetting = orig })

	rankingSetting = RankingSetting{DisplayMultiplier: 10}
	assert.Equal(t, 10.0, GetRankingDisplayMultiplier())
}
