#ifndef __NODE_CLIENT_H__
#define __NODE_CLIENT_H__

#define NAPI_DISABLE_CPP_EXCEPTIONS 1

#include <napi.h>
#include <string>
#include <enet.h>

#define NAPI_CALLBACK const Napi::CallbackInfo& info
#define OBJECT Napi::Object

#define ENV Napi::Env
#define GET_ARG(T, i) \
  info[i].As<T>()

#define VALUE Napi::Value

#define NEW_STR(e, s) \
  Napi::String::New(e, s)

#define NEW_BFR(e, d, l) \
  Napi::Buffer<unsigned char>::New(e, \
    d, \
    l, \
    [](ENV env, unsigned char* data) { \
      delete[] data; \
    })

class Client : public Napi::ObjectWrap<Client>
{
public:
  static OBJECT Init(ENV env, OBJECT exports);
  Client(NAPI_CALLBACK);

private:
  static Napi::FunctionReference constructor;

  VALUE getIP(NAPI_CALLBACK);
  void setIP(NAPI_CALLBACK, const VALUE& value);

  VALUE getPort(NAPI_CALLBACK);
  void setPort(NAPI_CALLBACK, const VALUE& value);

  void toggleProtocol(NAPI_CALLBACK);
  void setEmitter(NAPI_CALLBACK);

  // ENET METHODS
  void create(NAPI_CALLBACK);
  void connect(NAPI_CALLBACK);
  void service(NAPI_CALLBACK);
  void deInit(NAPI_CALLBACK);
  void sendPacket(NAPI_CALLBACK);
  void disconnect(NAPI_CALLBACK); 

private:
  std::string ip;
  unsigned int port;

  ENetHost* client;
  ENetPeer* peer;
  Napi::FunctionReference emit;
};

#endif