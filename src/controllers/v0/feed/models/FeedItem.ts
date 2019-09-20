import {Table, Column, Model, HasMany, PrimaryKey, CreatedAt, UpdatedAt, ForeignKey} from 'sequelize-typescript';
import { User } from '../../users/models/User';
//our model is corresponding to a table within our postgres table. 
@Table
export class FeedItem extends Model<FeedItem> {
  @Column
  public caption!: string;

  @Column
  public url!: string;

  @Column
  @CreatedAt //use Postgres interface to allow us to keep those up to date
  public createdAt: Date = new Date();

  @Column
  @UpdatedAt // use Postgres interface to allow us to keep those up to date
  public updatedAt: Date = new Date();
}
