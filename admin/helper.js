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
    $.debug($.dateformat(today));
    const getArticle = async () => {
      if (result) {
        return;
      } else {
        // console.time('t');
        const query = {'published' :{'$gt': today}};
        result  = await ArticleModel.model.findOne(query);
        today.setHours(-24 * 7,0,0);
        $.debug($.dateformat(today));
        // console.timeEnd('t');
        await getArticle();
      }
    }
    await getArticle();

    return result;
  }
}
