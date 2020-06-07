import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')  
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.1.17:3333/uploads/${point.image}`,
      }
    });

    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').select().where({ id }).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found' });
    }

    const serializedPoints = {
      ...point,
      image_url: `http://192.168.1.17:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point: serializedPoints, items });
  }

  async create(request: Request, response: Response) {
    
    const { 
      name, 
      email, 
      whatsapp, 
      latitude, 
      longitude, 
      city, 
      uf, 
      items 
    } = request.body;

    try {    
      const trx = await knex.transaction();
      
      const point = {
        name,
        image: request.file.filename, 
        email, 
        whatsapp, 
        latitude, 
        longitude, 
        city, 
        uf, 
      };
  
      const insertedIds = await trx('points').insert(point);
  
      const point_id = insertedIds[0];

      const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

      const pointItems = parsedItems.map((item_id: number) => {
        return { 
          item_id,
          point_id,
        }
      }); 
      
      await trx('point_items').insert(pointItems);

      await trx.commit();
      
      return response.json({
        id: point_id,
        ...point,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default PointsController;
