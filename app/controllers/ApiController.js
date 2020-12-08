const scraper = require('../services/SkillsScraperService');
const csvBuilder = require('../services/SkillsCsvService');

class ApiController {

  getAllSkills(flattern = false) {
    return scraper.getSkillsForFamily("Technical", "https://www.gov.uk/guidance/frontend-developer", flattern);
  }

  getAllSkillsCsv() {
    return scraper.getSkillsForFamily("Technical", "https://www.gov.uk/guidance/frontend-developer", true).then( data => {
      return new Promise(resolve => resolve(csvBuilder.buildCSV(data)));
    })
  }

  getAllSkillsForTableView() {
    return scraper.getSkillsForFamily("Technical", "https://www.gov.uk/guidance/frontend-developer", true).then( data => {
      return new Promise(resolve => {
        resolve( {
          headers: Object.keys(data[0]).map( (key) => ( { text: key } ) ),
          rows: data.map( (row) => {
            return Object.keys(row).map( (key) => ( { text: row[key] } ))
          })
        });
      });
    })
  }
}

module.exports = new ApiController()