package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
)

func GetRankings(c *gin.Context) {
	result, err := service.GetRankingsSnapshot(c.DefaultQuery("period", "week"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 倍率是实时配置，不写入缓存的 snapshot，避免缓存快照带上过期的倍率。
	// 浅拷贝一层再赋值，防止并发请求直接修改缓存中的共享对象。
	snapshot := *result
	snapshot.DisplayMultiplier = operation_setting.GetRankingDisplayMultiplier()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    &snapshot,
	})
}
