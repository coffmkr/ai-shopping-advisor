import vine from '@vinejs/vine'
import { CLICK_SOURCES } from '#models/types'

export const redirectValidator = vine.create({
  src: vine.enum(CLICK_SOURCES),
})
