const cheerioReq = require("cheerio-req");

class SkillsScraperService {
  getSkillsForFamily(family, url, flattenData = false) {
    return new Promise(resolve => {
      cheerioReq(url, (err, $) => {
        let family_skills = this.getSkills($);
        let result = {
          family: family,
          title: $("h1").text().trim(),
          levels: $('.govspeak h2')
            .map( (index, level) => {
              return this.transformLevelData($, family_skills, level);
            })
            .toArray()
            .slice(1,-1)
        };
        resolve( flattenData ? this.flattenData(result) : result );
      });
    })
  }

  getSkills($) {
    let skills = {};
    $('.govspeak h2').first().nextAll('h3').first().nextAll('ul').first().find('li')
      .each( (i, skill) => {
        let name = $(skill).find('strong').text().trim();
        let description = $(skill);
        description.find('strong').remove();
        skills[name] = description.text().substring(3).trim();
      });
    return skills;
  }

  transformLevelData($, family_skills, level) {
    let description = $(level).next('p').text().split('.');
    return {
      title: $(level).text().trim(),
      description: description.slice(0, -1).join('. ') + ".",
      duties_pretext: (description[description.length - 1]).trim(),
      duties: $(level).next('p').next('ul').find('li').map( (i, duty) => {
        return $(duty).text().trim();
      }).toArray(),
      skills: $(level).nextAll('h3').first().next('ul').find('li').map( (i, duty) => {
        let name = $(duty).find('strong').text().trim();
        let skill_level_description = $(duty);
        let skill_level = skill_level_description.text().substring(3).match(/\(Relevant skill level: (.*?)\)/)[1];

        skill_level_description.find('strong').remove();
        skill_level = skill_level.charAt(0).toUpperCase() + skill_level.slice(1);

        return {
          name: name,
          description: family_skills[name],
          skill_level: skill_level,
          skill_level_description: skill_level_description.text().substring(3).replace(/\(Relevant skill level: (.*?)\)/, '').trim(),
        };
      }).toArray()
    }
  }

  flattenData(roles) {
    var data = [];
    roles.levels.forEach( level => {
      level.skills.forEach( skill => {
        data.push({
          job_family: roles.family,
          role: roles.title,
          role_level: level.title,
          role_description_intro: roles.levels[0].description,
          skills_they_need: `${level.description}\n\n${level.duties_pretext}\n${level.duties.map(d => `- ${d}`).join('\n')}`,
          skill_name: skill.name,
          skill_description: skill.description,
          skill_level: skill.skill_level,
          skill_level_description: skill.skill_level_description
        });
      });
    });
    return data;
  }
}

module.exports = new SkillsScraperService()