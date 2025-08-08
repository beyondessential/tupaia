import { Pusher } from '../Pusher';

export class EntityPusher extends Pusher {
  /**
   * @protected
   *
   * @returns {Promise<EntityType>}
   * @throws {Error} If the entity is not found
   */
  async fetchEntity() {
    const id = this.change.record_id;
    const entity = await this.models.entity.findById(id);
    if (!entity) {
      throw new Error(`Entity with id '${id}' not found`);
    }

    return entity;
  }
}
