/* Simple steam api request using json returns steam sales from (Daily deal + Sales) using HTTP.

Copyright (C) 2013  Mathieu Rhéaume <mathieu@codingrhemes.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Functions that are used by the app.
function formatPrice(strPrice)
{
	return strPrice.substr(0,strPrice.length -2) + "," + strPrice.substr(strPrice.length - 2) + "$";
}

// Main program!
var http = require('http');

var server = http.createServer(function (req, res) {
		// Original Steam API URL.
		var options = {
host: 'store.steampowered.com',
path: '/api/featuredcategories'
};

http.get(options, function (response) {
	var str = '';

	//another chunk of data has been recieved, so append it to `str`
	response.on('data', function (chunk) {
		str += chunk;
		});

	//the whole response has been recieved!
	response.on('end', function () {
		var responseJSON;
		// Parse my JSON bro.
		responseJSON = JSON.parse(str);
		// Finding the daily deal as there is a lot of sales!!
		var iCpt = 0;
		var dailyDealJSON;
		while (responseJSON[iCpt].name != "Daily Deal") {
		iCpt = iCpt + 1;
		}
		dailyDealJSON = responseJSON[iCpt];
		// Correct the prices provided by steam.
		// Formatting 4099 to 40,99$  per example.
		dailyDealJSON.items[0].final_price = formatPrice(JSON.stringify(dailyDealJSON.items[0].final_price));
		

		// Format prices and compute discounted price in Specials
		for (iCpt = 0; iCpt < responseJSON.specials.items.length; iCpt++)
		{
		// Add , and $ to the prices.
		responseJSON.specials.items[iCpt].original_price = formatPrice(JSON.stringify(responseJSON.specials.items[iCpt].original_price))
		responseJSON.specials.items[iCpt].final_price = formatPrice(JSON.stringify(responseJSON.specials.items[iCpt].final_price))
		// Add % to the discounted prices
		responseJSON.specials.items[iCpt].discount_percent = JSON.stringify(responseJSON.specials.items[iCpt].discount_percent) + "%"
		}

		// Build the JSON Object	
		var dealsJSON = {
			"dailyDeal": dailyDealJSON,
			"specials": responseJSON.specials
		};
		res.writeHead(200, {
				"Content-Type": "application/json"
				});

		res.write(JSON.stringify(dealsJSON));
		res.end();
	});
});
});

server.listen(8080);
