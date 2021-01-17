#define NAPI_DISABLE_CPP_EXCEPTIONS 1
#define MAX_PEERS 1024

#include <enet.h>
#include <napi.h>
#include <unordered_map>
#include <cstring>

ENetHost* client;
ENetAddress address;

Napi::FunctionReference on_conn;
Napi::FunctionReference on_recv;
Napi::FunctionReference on_dscn;

unsigned int netID = 0;

#define NAPI_ARG Napi::CallbackInfo& info

#define NAPI_FN(o, k, e, f) \
  o[k] = Napi::Function::New(e, f)

#define NAPI_STR(e, s) \
  Napi::String::New(e, s)

#define NAPI_NUM(e, i) \
  Napi::Number::New(e, i)

void __init(NAPI_ARG)
{
  bool usingNewPacket = info[0].As<Napi::Boolean>().Value();
  enet_initialize();

  client = enet_host_create (NULL /* create a client host */,
            1024 /* only allow 1 outgoing connection */,
            2 /* allow up 2 channels to be used, 0 and 1 */,
            0 /* assume any amount of incoming bandwidth */,
            0 /* assume any amount of outgoing bandwidth */);

  client->usingNewPacket = usingNewPacket;
  client->checksum       = enet_crc32;

  enet_host_compress_with_range_coder(client);
}

Napi::String __new_conn(NAPI_ARG)
{
  ENetAddress address;
  ENetPeer* peer;

  const char* host  = info[0].As<Napi::String>().Utf8Value().c_str();
  unsigned int port = info[1].As<Napi::Number>().Uint32Value();
 
  address.port = port;
  enet_address_set_host(&address, host);

  peer = enet_host_connect(client, &address, 2, 0);
  peer->data = (void*)++netID;
}

void __peer_service(NAPI_ARG)
{
  Napi::Env env = info.Env();
  ENetEvent event;

  if (enet_host_service(client, &event, 0) > 0)
  {
    switch (event.type)
    {
      case ENET_EVENT_TYPE_CONNECT:
      {
        unsigned int id = (unsigned int)event.peer->data;

        on_conn.Call({
          NAPI_NUM(env, id)
        });
      } break;

      case ENET_EVENT_TYPE_RECEIVE:
      {
        unsigned int id     = (unsigned int)event.peer->data;
        size_t size         = event.packet->dataLength;
        unsigned char* pckt = new unsigned char[size];

        memcpy(pckt, event.packet->data, size);

        on_recv.Call({
          NAPI_NUM(env, id),
          Napi::Buffer<unsigned char>::New(env, 
            pckt, 
            size, 
            [](Napi::Env env, unsigned char* data) {
              delete[] data;
            })
        });

        enet_packet_destroy(event.packet);
      } break;

      case ENET_EVENT_TYPE_DISCONNECT:
      {
        unsigned int id = (unsigned int)event.peer->data;

        on_dscn.Call({
          NAPI_NUM(env, id)
        });
      } break;

      case ENET_EVENT_TYPE_NONE:
      {} break;
    }
  }
}

void __set_cb(NAPI_ARG)
{
  on_conn = Napi::Persistent<Napi::Function>(info[0].As<Napi::Function>());
  on_recv = Napi::Persistent<Napi::Function>(info[1].As<Napi::Function>());
  on_dscn = Napi::Persistent<Napi::Function>(info[2].As<Napi::Function>());
}

void __send(NAPI_ARG)
{
  unsigned int id = info[0].As<Napi::Number>().Uint32Value();

  auto buf    = info[1].As<Napi::Buffer<unsigned char>>();
  size_t size = buf.Length();

  for (int i = 0; i < client->peerCount; ++i)
  {
    ENetPeer* peer = &client->peers[i];
    if (!peer->data) continue;

    unsigned int p_id = (unsigned int)peer->data;
    if (p_id == id)
    {
      ENetPacket* packet = enet_packet_create(buf.Data(), size, ENET_PACKET_FLAG_RELIABLE);
      enet_peer_send(peer, 0, packet);

      break;
    }
  }
}

void __disconnect(NAPI_ARG)
{
  unsigned int id = info[0].As<Napi::Number>().Uint32Value();

  for (int i = 0; i < client->peerCount; ++i)
  {
    ENetPeer* peer = &client->peers[i];
    if (!peer->data) continue;

    unsigned int p_id = (unsigned int)peer->data;
    if (p_id == id)
    {
      enet_peer_disconnect(peer, 0);
      break;
    }
  }
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  NAPI_FN(exports, "init", env, __init);
  NAPI_FN(exports, "new_conn", env, __new_conn);
  NAPI_FN(exports, "peer_service", env, __peer_service);
  NAPI_FN(exports, "set_cb", env, __set_cb);
  NAPI_FN(exports, "send", env, __send);
  NAPI_FN(exports, "disconnect", env, __disconnect);

  return exports;
}

NODE_API_MODULE(Proxy, Init)