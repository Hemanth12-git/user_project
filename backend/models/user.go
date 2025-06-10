package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName    string             `bson:"firstName" json:"firstName"`
	LastName     string             `bson:"lastName" json:"lastName"`
	Email        string             `bson:"email" json:"email"`
	PhoneNumber  string             `bson:"phoneNumber" json:"phoneNumber"`
	Password     string             `bson:"password" json:"-"`
	Role         string             `bson:"role" json:"role"`
	CreatedOn    string             `bson:"createdOn" json:"createdOn"`
	Status       string             `bson:"status" json:"status"`
	Currency     string             `bson:"currency" json:"currency"`
	NumberFormat string             `bson:"numberFormat" json:"numberFormat"`
	UserType     string             `bson:"userType" json:"userType"`
}
