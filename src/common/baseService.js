class BaseService {
  constructor(repo) {
    this.repo = repo;
  }

  async getById(id, options) {
    const { include, exclude } = options || {};
    return await this.repo.getById(id, { include, exclude });
  }

  async getList(filters, options) {
    const { include, exclude, sort, limit, page } = options || {};
    return await this.repo.getList(filters, { include, exclude, sort, limit, page });
  }

  async getCount(filters) {
    return await this.repo.getCount(filters);
  }

  async create(model) {
    return await this.repo.create(model);
  }

  async update(model) {
    return await this.repo.update(model);
  }

  async upsert(model) {
    return await this.repo.update(model, true);
  }

  async updateObjectFields(identifier, updates) {
    return await this.repo.updateObjectFields(identifier, updates);
  }

  async createMany(models) {
    return await this.repo.createMany(models);
  }

  async updateMany(models) {
    return await this.repo.updateMany(models);
  }

  async upsertMany(models) {
    return await this.repo.updateMany(models, true);
  }

  async updateManyObjectsFields(filters = {}, updates) {
    await this.repo.updateManyObjectsFields(filters, updates);
  }

  async deleteById(id, softDelete = false) {
    if (!id) return;
    return softDelete
      ? await this.repo.updateObjectFields({ id }, { isDeleted: true })
      : await this.repo.deleteById(id);
  }

  async deleteManyByIds(ids, softDelete = false) {
    if (!ids.length) return;
    softDelete
      ? await this.repo.updateManyObjectsFields({ ids }, { isDeleted: true })
      : await this.repo.deleteManyByIds(ids);
  }
}

module.exports = BaseService;
