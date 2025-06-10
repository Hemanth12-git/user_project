package controllers

import (
	"net/http"
	"strconv"
	"user_project/backend/models"
	"user_project/backend/services"

	"github.com/gin-gonic/gin"

	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	sortField := c.DefaultQuery("sortField", "createdOn")
	sortOrder := c.DefaultQuery("sortOrder", "desc")
	search := c.Query("search")

	filter := bson.M{}
	if search != "" {
		filter["$or"] = []bson.M{
			{"firstName": bson.M{"$regex": search, "$options": "i"}},
			{"lastName": bson.M{"$regex": search, "$options": "i"}},
			{"email": bson.M{"$regex": search, "$options": "i"}},
			{"phoneNumber": bson.M{"$regex": search, "$options": "i"}},
			{"currency": bson.M{"$regex": search, "$options": "i"}},
			{"numberFormat": bson.M{"$regex": search, "$options": "i"}},
			{"status": bson.M{"$regex": search, "$options": "i"}},
		}
	}
	totalCount, err := services.CountUsers(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	findOptions := options.Find()
	findOptions.SetSkip(int64((page - 1) * limit))
	findOptions.SetLimit(int64(limit))
	order := -1
	if sortOrder == "asc" {
		order = 1
	}
	findOptions.SetSort(bson.D{{Key: sortField, Value: order}})

	users, err := services.GetUsers(filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": users, "totalUsers": totalCount})
}

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Println("User Input:", user)
	result, err := services.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var updateData bson.M
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := services.UpdateUser(id, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	result, err := services.DeleteUser(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
