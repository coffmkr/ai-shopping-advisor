import { ClickEventSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import type { ClickSource } from '#models/types'

export default class ClickEvent extends ClickEventSchema {
  static table = 'click_events'

  @column()
  declare source: ClickSource
}
