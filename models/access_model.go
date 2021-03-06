package models

import (
	database "../services/db"
	// "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"time"
)

type Access struct {
	Id        bson.ObjectId `json:"_id" bson:"_id,omitempty"`
	Article   bson.ObjectId `json:"article" bson:"article"`
	User      bson.ObjectId `json:"user" bson:"user"`
	Ip        string        `json:"ip" bson:"ip"`
	Info      string        `json:"info" bson:"info"`
	CreatedAt time.Time     `json: "created_at" bson:"created_at"`
}

type AccessQuery struct {
	AccessBaseQuery
}

type AccessBaseQuery struct {
	Start int `form:"start" binding:"exists"`
	Count int `form:"count" binding:"exists"`
}

func (m *Base) AccessesCount(q AccessQuery) (int, error) {
	ds := database.NewSessionStore()
	defer ds.Close()
	coll := ds.C(m.Name)
	count, err := coll.Find(bson.M{}).Count()
	return count, err
}

func (m *Base) FindAccesses(q AccessQuery) ([]bson.M, error) {
	ds := database.NewSessionStore()
	defer ds.Close()
	coll := ds.C(m.Name)
	pipe := []bson.M{
		bson.M{"$match": bson.M{}},
		bson.M{"$sort": bson.M{"createdAt": -1}},
		bson.M{"$skip": q.Count * q.Start},
		bson.M{"$limit": q.Count},
		bson.M{"$lookup": bson.M{
			"from":         "articles",
			"localField":   "article",
			"foreignField": "_id",
			"as":           "article",
		}},
		bson.M{"$project": bson.M{"article": bson.M{
			"edited_content": 0,
			"origin_content": 0,
			"trans_content":  0,
			"summary":        0,
			"origin_title":   0,
		}}},
	}
	resp := []bson.M{}
	err := coll.Pipe(pipe).All(&resp)
	return resp, err
}
