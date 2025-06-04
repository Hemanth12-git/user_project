package routes

import (
    "github.com/gin-gonic/gin"
    "user_project/backend/controller"
)

func UserRoutes(router *gin.Engine) {
    users := router.Group("/users")
    {
        users.GET("", controllers.GetUsers)
        users.POST("", controllers.CreateUser)
        users.PUT("/:id", controllers.UpdateUser)
        users.DELETE("/:id", controllers.DeleteUser)
    }
}
