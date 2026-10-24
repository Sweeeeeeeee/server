#include <emscripten/bind.h>
#include "ke.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(ke_module) {
    value_object<ke::entry>("Entry")
        .field("q", &ke::entry::q)
        .field("t", &ke::entry::t)
        .field("a", &ke::entry::a);

    register_vector<std::string>("StringVector");

    class_<ke::ke>("Ke")
        .constructor<std::string>()
        .function("scoreGet", &ke::ke::scoreGet)
        .function("answer", &ke::ke::answer)
        .function("get1", &ke::ke::get1)
        .function("get2", &ke::ke::get2);
}
