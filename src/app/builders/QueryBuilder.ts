/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    let search = this?.query?.search;

    if (search) {
      if (!isNaN(Number(search))) {
        // Convert search to number if it's numeric
        search = Number(search);
        this.modelQuery = this.modelQuery.find({
          $or: searchableFields.map((field) => ({
            [field]: search, // Direct match for numeric fields
          })),
        });
      } else {
        // If search is a string, use regex
        this.modelQuery = this.modelQuery.find({
          $or: searchableFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
          })),
        });
      }
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // Copy query object
    const excludeFields = ['search', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Handle minPrice and maxPrice filtering
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceQuery: Record<string, any> = {};

      if (queryObj.minPrice) {
        priceQuery['$gte'] = Number(queryObj.minPrice); // Convert to number
        delete queryObj.minPrice;
      }

      if (queryObj.maxPrice) {
        priceQuery['$lte'] = Number(queryObj.maxPrice); // Convert to number
        delete queryObj.maxPrice;
      }

      if (Object.keys(priceQuery).length > 0) {
        queryObj['price'] = priceQuery;
      }
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    // Create a separate query without pagination
    const totalQuery = this.modelQuery.model.find(this.modelQuery.getQuery());

    const total = await totalQuery.countDocuments();
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
