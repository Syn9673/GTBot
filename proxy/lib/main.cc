#include <client.h>

auto Init(ENV env, OBJECT exports)
{
  Client::Init(env, exports);
  return exports;
}

NODE_API_MODULE(GTBot_Proxy, Init)