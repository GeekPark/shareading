/**
 * @author eric
 * @version 1.0.0
 */
import $      from '../utils';
import Models from '../models';
import Base   from './base';
import mongoose from 'mongoose';

const ArticleModel = Models.ArticleModel;



export default {
  getRecent: async () => {
    const today = new Date();
    let result = [];
    today.setHours(0,0,0);
    const getArticle = async () => {
      if (result.length > 0) {
        return;
      } else {
        const query = {'published' :{'$gt': today}};
        result  = await ArticleModel.model.aggregate([
                     {$match: query},
                     {$project: {
                      _id: 1,
                      published: 1,
                      origin_title: 1,
                      trans_title: 1
                     }},
                     {$sort: {published: -1}}
                  ]);
        today.setHours(-24 * 7,0,0);
        await getArticle();
      }
    }
    await getArticle();
    return result[0];
  }
}
