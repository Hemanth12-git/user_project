package controllers

import (
	"net/http"
	"strconv"
	"user_project/backend/models"
	"user_project/backend/services"

	"log"
	"time"

	"github.com/gin-gonic/gin"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	sortField := c.DefaultQuery("sortField", "createdOn")
	sortOrder := c.DefaultQuery("sortOrder", "desc")
	name := c.Query("name")
	email := c.Query("email")
	role := c.Query("role")
	userType := c.Query("userType")
	status := c.Query("status")
	fromDateStr := c.Query("fromDate")
	toDateStr := c.Query("toDate")

	filter := bson.M{}

	if name != "" {
		filter["$or"] = []bson.M{
			{"firstName": bson.M{"$regex": name, "$options": "i"}},
			{"lastName": bson.M{"$regex": name, "$options": "i"}},
		}
	}

	if userType != "" {
		filter["userType"] = bson.M{"$regex": userType, "$options": "i"}
	}
	if email != "" {
		filter["email"] = bson.M{"$regex": email, "$options": "i"}
	}
	if role != "" {
		filter["role"] = bson.M{"$regex": role, "$options": "i"}
	}
	if status != "" {
		filter["status"] = bson.M{"$regex": status, "$options": "i"}
	}

	if fromDateStr != "" || toDateStr != "" {
		createdOnFilter := bson.M{}
		if fromDateStr != "" {
			fromDate, err := time.Parse(time.RFC3339, fromDateStr)
			if err == nil {
				createdOnFilter["$gte"] = fromDate
			}
		}
		if toDateStr != "" {
			toDate, err := time.Parse(time.RFC3339, toDateStr)
			if err == nil {
				createdOnFilter["$lte"] = toDate
			}
		}
		if len(createdOnFilter) > 0 {
			filter["createdOn"] = createdOnFilter
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
	log.Println("UserType received:", user.UserType)
	log.Printf("Full user struct: %+v", user)
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
