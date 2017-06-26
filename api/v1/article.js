/**
 * @author eric
 * @version 1.0.0
 */
import $      from '../../utils'
import Models from '../../models'
import Base   from './base'
import mongoose from 'mongoose'
import helper from '../../admin/helper'

const {ArticleModel, AccessModel, LikeModel} = Models;

const selectAccess = {$lookup:{
  from: "accesses",
  localField: "_id",
  foreignField: "article",
  as: "accesses"
}};

const selectLike = {$lookup:{
  from: "likes",
  localField: "_id",
  foreignField: "article",
  as: "likes"
}};

const selectArticle = {
  origin_content: 0,
  trans_content: 0,
  edited_content: 0,
  origin_title: 0,
};

export default {

  show: async (req, res) => {
    const ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
    const query = {article: req.params.id, ip: ip};
    const exist = await AccessModel.find(query);
    if ($.empty(exist)) {
      await AccessModel.create(query);
    }
    $.result(res, await ArticleModel.findById(req.params.id));
  },

  index: async (req, res) => {
    const date       = await lastDate(req);
    const query      = {'published' :{'$lte': date}};
    const list       = await queryArticles(query);
    const hotList    = hot(list);
    const editedList = edited(hotList.concat(list));
    $.result(res, {
      list: editedList,
      total: await ArticleModel.count()
    });
  },

  myLikes: async (req, res) => { // 我的收藏
    const date = getSomeDay(req, -48);
    const user = mongoose.Types.ObjectId(req.params.user);
    const query = {createdAt :{'$gt': date}, from: user};
    const list = await queryLikes(query);
    $.result(res, {
      list,
      total: await LikeModel.count()
    });
  }
}

async function queryLikes (query) {
  const list  = await LikeModel.model.aggregate([
                 {$sort: {createdAt: -1}},
                 {$match: query},
                 {$lookup:{
                    from: "articles",
                    localField: "article",
                    foreignField: "_id",
                    as: "article"
                 }},
                 {$lookup:{
                    from: "likes",
                    localField: "article",
                    foreignField: "article",
                    as: "likes"
                 }},
                 {$project: {
                    article: selectArticle
                 }}
               ]).allowDiskUse(true);
  return list.map(el => {
    const article = el.article[0];
    return article;
  });
}


async function queryArticles (query) {
  const list  = await ArticleModel.model.aggregate([
                 {$sort: {published: -1}},
                 {$match: query },
                 selectLike,
                 selectAccess,
                 {$project: selectArticle},
                 {$limit: 20}
                ]).allowDiskUse(true);
  return list;
}


function someDay (req, hours) {
  const today = req.query.date ? (new Date(req.query.date)) : (new Date());
  today.setHours(hours, 0, 0);
  return today;
}

async function lastDate (req) {
  if (req.query.last) {
    return new Date(req.query.last);
  } else {
    const recent = await helper.getRecent();
    return new Date(recent.published);
  }
}

function hot (list) {
  const hot = [];
  list.forEach((el, index) => {
    el.likes = el.likes.length;
    el.accesses = el.accesses.length;
    if (el.likes * 10 + el.accesses >= 20) { // hot
      hot.push(el);
      list.splice(index, 1);
    }
  })
  return hot;
}

function edited (list) {
  return list.map(el => {
    if (!el.edited_title) {
      el.edited_title = el.trans_title;
      delete el.trans_title;
    }
    return el;
  })
}
