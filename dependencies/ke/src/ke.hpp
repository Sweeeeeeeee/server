#ifndef KE_HPP
#define KE_HPP

#include <vector>
#include <string>
#include <algorithm>
#include <locale>
#include <codecvt>
#include <ctime>

#include "json.hpp"

namespace ke {
	struct entry {
		std::string q, t;
		std::vector<std::string> a;
	};

	class ke {
		private:
			std::vector<entry> map;

			entry selected;
			float score;
			int total;

		public:
			ke(std::string file);

			float scoreGet() const;

			entry answer(std::string answer);
			std::string get1();
			std::vector<std::string> get2(int r) const;
	};
}

#endif // KE_HPP
