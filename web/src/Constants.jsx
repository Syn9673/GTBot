import crypto from 'crypto'
import TextPacket from './Packets/TextPacket'

export const MessageTypes = {
  HELLO:  1,
  TEXT:   2,
  ACTION: 3,
  TANK:   4
}

export const TankPacketNames = [
  "PACKET_STATE", "PACKET_CALL_FUNCTION", "PACKET_UPDATE_STATUS", "PACKET_TILE_CHANGE_REQUEST", "PACKET_SEND_MAP_DATA",
  "PACKET_SEND_TILE_UPDATE_DATA", "PACKET_SEND_TILE_UPDATE_DATA_MULTIPLE", "PACKET_TILE_ACTIVATE_REQUEST", "PACKET_TILE_APPLY_DAMAGE",
  "PACKET_SEND_INVENTORY_STATE", "PACKET_ITEM_ACTIVATE_REQUEST", "PACKET_ITEM_ACTIVATE_OBJECT_REQUEST", "PACKET_SEND_TILE_TREE_STATE",
  "PACKET_MODIFY_ITEM_INVENTORY", "PACKET_ITEM_CHANGE_OBJECT", "PACKET_SEND_LOCK", "PACKET_SEND_ITEM_DATABASE_DATA", "PACKET_SEND_PARTICLE_EFFECT",
  "PACKET_SET_ICON_STATE", "PACKET_ITEM_EFFECT", "PACKET_SET_CHARACTER_STATE", "PACKET_PING_REPLY", "PACKET_PING_REQUEST", "PACKET_GOT_PUNCHED",
  "PACKET_APP_CHECK_RESPONSE", "PACKET_APP_INTEGRITY_FAIL", "PACKET_DISCONNECT", "PACKET_BATTLE_JOIN", "PACKET_BATTLE_EVENT", "PACKET_USE_DOOR",
  "PACKET_SEND_PARENTAL", "PACKET_GONE_FISHIN", "PACKET_STEAM", "PACKET_PET_BATTLE", "PACKET_NPC", "PACKET_SPECIAL", "PACKET_SEND_PARTICLE_EFFECT_V2",
  "PACKET_ACTIVE_ARROW_TO_ITEM", "PACKET_SELECT_TILE_INDEX", "PACKET_SEND_PLAYER_TRIBUTE_DATA", "PACKET_SET_EXTRA_MODS", "PACKET_ON_STEP_ON_TILE_MOD",
  "PACKET_ERRORTYPE"
]

export const getStringType = (type) => TankPacketNames[type]

export const VariantTypes = {
  NONE:   0,
  FLOAT1: 1,
  STRING: 2,
  FLOAT2: 3,
  FLOAT4: 4,
  UINT:   5,
  INT:    9
}

export const LoginInfo = ({ isGuest, user = {} } = {}) => {
  let text = `requestedName|CakeFairy
f|1
protocol|117
game_version|3.52
fz|7134376
lmode|0
cbits|0
player_age|100
GDPR|1
hash2|2147483647
meta|${user.meta || 'localhost'}
fhash|-716928004
rid|${crypto.randomBytes(16).toString('hex')}
platformID|0
deviceVersion|0
country|us
hash|2147483647
mac|${RandomMac()}
wk|${crypto.randomBytes(16).toString('hex')}
zf|-1331849031`

  if (!isGuest)
    text += `
tankIDName|${user.name}
tankIDPass|${user.pass}`

  if (user.redir) {
    text += `
lmode|${user.redirlmode}
token|${user.redir.token}
userid|${user.redir.userid}
`
  }

  const packet = new TextPacket(MessageTypes.TEXT, [text])
  return packet
}

const RandomMac = () => {
  const arr = []
  for (let i = 0; i < 5; i++)
    arr.push(crypto.randomBytes(1)[0])

  return arr.map(i => i.toString(16)).join(':').toUpperCase()
}