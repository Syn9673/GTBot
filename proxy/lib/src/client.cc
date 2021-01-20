#include <client.h>

Napi::FunctionReference Client::constructor;

Client::Client(NAPI_CALLBACK) : Napi::ObjectWrap<Client>(info)
{
  ENV env = info.Env();

  this->ip   = GET_ARG(Napi::String, 0).Utf8Value();
  this->port = GET_ARG(Napi::Number, 1).Uint32Value();
}

VALUE Client::getIP(NAPI_CALLBACK)
{
  ENV env = info.Env();
  return Napi::String::New(env, this->ip);
}

void Client::setIP(NAPI_CALLBACK, const VALUE& value)
{
  this->ip = value.As<Napi::String>().Utf8Value();
}

VALUE Client::getPort(NAPI_CALLBACK)
{
  ENV env = info.Env();
  return Napi::Number::New(env, this->port);
}

void Client::setPort(NAPI_CALLBACK, const VALUE& value)
{
  this->port = value.As<Napi::Number>().Uint32Value();
}

void Client::toggleProtocol(NAPI_CALLBACK)
{
  this->client->usingNewPacket = !this->client->usingNewPacket;
}

void Client::setEmitter(NAPI_CALLBACK)
{
  this->emit = Napi::Persistent(GET_ARG(Napi::Function, 0));
}

void Client::create(NAPI_CALLBACK)
{
  enet_initialize();
  this->client = enet_host_create(NULL,
    1,
    2,
    0,
    0);

  this->client->checksum       = enet_crc32;
  this->client->usingNewPacket = GET_ARG(Napi::Boolean, 0).Value();

  enet_host_compress_with_range_coder(this->client);
}

void Client::connect(NAPI_CALLBACK)
{
  ENetAddress address;
  address.port = this->port;

  enet_address_set_host_ip(&address, this->ip.c_str());

  this->peer = enet_host_connect(this->client,
    &address,
    2,
    0);
}

void Client::service(NAPI_CALLBACK)
{
  ENetEvent event;
  ENV env = info.Env();

  if (enet_host_service(this->client, &event, 0) > 0)
  {
    switch (event.type)
    {
      case ENET_EVENT_TYPE_CONNECT:
      {
        this->emit.Call({
          NEW_STR(env, "connect")
        });
      } break;

      case ENET_EVENT_TYPE_RECEIVE:
      {
        size_t packetSize     = event.packet->dataLength;
        unsigned char* packet = new unsigned char[packetSize];

        memcpy(packet, event.packet->data, packetSize);
        enet_packet_destroy(event.packet);

        emit.Call({
          NEW_STR(env, "receive"),
          NEW_BFR(env, packet, packetSize)
        });
      }
    }
  }
}

void Client::deInit(NAPI_CALLBACK)
{
  enet_deinitialize();
}

void Client::sendPacket(NAPI_CALLBACK)
{
  auto buffer        = GET_ARG(Napi::Buffer<unsigned char>, 0);
  ENetPacket* packet = enet_packet_create(buffer.Data(),
    buffer.ByteLength(),
    ENET_PACKET_FLAG_RELIABLE);

  enet_peer_send(this->peer, 0, packet);
}

void Client::disconnect(NAPI_CALLBACK)
{
  enet_peer_disconnect_later(this->peer, 0);
}

OBJECT Client::Init(ENV env, OBJECT exports)
{
  Napi::Function func = DefineClass(
    env,
    "Client",
    {
      InstanceAccessor<&Client::getIP, &Client::setIP>("ip"),
      InstanceAccessor<&Client::getPort, &Client::setPort>("port"),
      InstanceMethod<&Client::toggleProtocol>("toggleProtocol"),
      InstanceMethod<&Client::setEmitter>("setEmitter"),

      // ENet Methods
      InstanceMethod<&Client::create>("create"),
      InstanceMethod<&Client::connect>("connect"),
      InstanceMethod<&Client::service>("service"),
      InstanceMethod<&Client::deInit>("deInit"),
      InstanceMethod<&Client::sendPacket>("sendPacket")
    }
  );
  
  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports["Client"] = func;

  return exports;
}