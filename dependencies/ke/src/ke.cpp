#include "ke.hpp"

float f(int dist, int size) {
	if (size == 0) {
		if (dist == 0) {
			return 1;
		}else {
			return 0;
		}
	}

	float base = 1 - ((float)dist) / ((float)size);

	if (base < 0) {
		return 0;
	}else {
		return base * base;
	}
}

bool equal(char32_t x, char32_t y) {
	return (x == y) || ((x < 256) && (y < 256) && (std::min(x, y) + 'A' - 'a' == std::max(x, y)));
}

int editDist(const std::u32string& a, const std::u32string& b) {
	if ((a.size() == 0) || (b.size() == 0)) {
		return a.size() + b.size();
	}

	std::vector<std::vector<int>> dp(a.size() + 1, std::vector<int>(b.size() + 1, 0));
 
	for (int i = 0; i < dp.size(); i++) {
		dp[i].back() = a.size() - i;
	}
	for (int i = 0; i < dp.back().size(); i++) {
		dp.back()[i] = b.size() - i;
	}
	for (int i = a.size() - 1; 0 <= i; i--) {
		for (int j = b.size() - 1; 0 <= j; j--) {
			if (equal(a[i], b[j])) {
				dp[i][j] = dp[i + 1][j + 1];
			}else {
				dp[i][j] = 1 + std::min(std::min(dp[i][j + 1], dp[i + 1][j + 1]), dp[i + 1][j]);
			}
		}
	}
 
	return dp.front().front();
}

float eval(const std::vector<std::string>& target, const std::string& s_) {
	std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert;
    
    std::u32string s = convert.from_bytes(s_);
	
	float max = 0.0f;
	
	for (const auto& t_ : target) {
    	std::u32string t = convert.from_bytes(t_);
		
		max = std::max(max, f(editDist(t, s), t.size()));
	}

	return max;
}

ke::ke::ke(std::string file) : score(1.0f), total(0) {
	std::srand(std::time({}));

    nlohmann::json j = nlohmann::json::parse(file);
    
	map.reserve(j.size());
    for (const auto& item : j) {
        entry newEntry;
        
		newEntry.q = item["q"];
        newEntry.a = item["a"];
        newEntry.t = item["t"];
        
		map.push_back(newEntry);
    }
}

float ke::ke::scoreGet() const {
	return score;
}

ke::entry ke::ke::answer(std::string answer) {
	score = (score * total + eval(selected.a, answer)) / (total + 1);
	total++;

	return selected;
}

std::string ke::ke::get1() {
	selected = map[std::rand() % map.size()];

	return selected.q;
}

std::vector<std::string> ke::ke::get2(int r) const {
	std::vector<std::string> res;
	
	res.reserve(r);
	for (int i = 0; i < r; i++) {
		res.push_back(map[rand() % map.size()].a.front());
	}
	res[rand() % r] = selected.a.front();

	return res;
}
