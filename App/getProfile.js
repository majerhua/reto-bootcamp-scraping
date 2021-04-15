let btnstrap = document.getElementById("btnstrap");

btnstrap.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapingProfile,
  });
});

function scrapingProfile() {
  const cssSelectorsProfile = {
    profile: {
      name: "div.ph5 > div.mt2 > div > ul > li",
      resumen: "div.ph5 > div.mt2 > div > ul ~ h2",
      // country: 'div.ph5.pb5 > div.display-flex.mt2.pv-top-card--reflow > div.pv-top-card__list-container > ul.cx.mt1 > li'
      country: "div.ph5 > div.mt2 > div > ul.mt1 > li.t-16",
      email: "div > section.pv-contact-info__contact-type.ci-email > div > a",
      phone:
        "div > section.pv-contact-info__contact-type.ci-phone > ul > li > span",
      education: "section.pv-profile-section > ul > li .pv-entity__school-name",
      experience:
        "#experience-section > ul.pv-profile-section__section-info > li.pv-entity__position-group-pager .pv-entity__summary-info",
      urlLinkedin:
        "div > section.pv-contact-info__contact-type.ci-vanity-url > div > a",
    },
    option: {
      buttonSeeMore: '[data-control-name="contact_see_more"]',
      buttonCloseSeeMore: "button.artdeco-modal__dismiss",
    },
  };

  const wait = (milliseconds) => {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, milliseconds);
    });
  };

  const autoscrollToElement = async function (cssSelector) {
    const exists = document.querySelector(cssSelector);

    while (exists) {
      let maxScrollTop = document.body.clientHeight - window.innerHeight;
      let elementScrollTop = document.querySelector(cssSelector).offsetHeight;
      let currentScrollTop = window.scrollY;

      if (
        maxScrollTop == currentScrollTop ||
        elementScrollTop <= currentScrollTop
      )
        break;

      await wait(32);

      let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop);

      window.scrollTo(0, newScrollTop);
    }

    console.log("Finish autoscroll to element %s", cssSelector);

    return new Promise(function (resolve) {
      resolve();
    });
  };

  const getContactProfile = async () => {
    const {
      profile: {
        name: nameCss,
        resumen: resumenCss,
        country: countryCss,
        email: emailCss,
        phone: phoneCss,
        education: educationCss,
        experience: experienceCss,
        urlLinkedin: urlLinkedinCss,
      },
      option: {
        buttonSeeMore: buttonSeeMoreCss,
        buttonCloseSeeMore: buttonCloseSeeMoreCss,
      },
    } = cssSelectorsProfile;

    const name = document.querySelector(nameCss)?.innerText;
    const resumen = document.querySelector(resumenCss)?.innerText;
    const country = document.querySelector(countryCss)?.innerText;

    const education = document.querySelectorAll(educationCss);
    const educationAll = [];

    let i;
    for (i = 0; i < education.length; i++) {
      educationAll.push(education[i].innerText);
    }

    const experience = document.querySelectorAll(experienceCss);
    const experienceAll = [];
    let j;
    for (j = 0; j < experience.length; j++) {
      let nameExperience = experience[j].childNodes[1].innerText;
      let companyWork = experience[j].childNodes[5].innerText;
      let timeWork = experience[j].childNodes[8].innerText;
      experienceAll.push({
        nameExperience,
        companyWork,
        timeWork,
      });
    }

    const buttonSeeMore = document.querySelector(buttonSeeMoreCss);
    buttonSeeMore.click();

    await wait(1000);

    const email = document.querySelector(emailCss)?.innerText;
    const phone = document.querySelector(phoneCss)?.innerText;

    let basicProfile = {
      name,
      resumen,
      country,
      email,
      phone,
    };

    let urlLinkedin = document.querySelector(urlLinkedinCss)?.innerText;
    if (urlLinkedin) urlLinkedin = `https://${urlLinkedin}`;

    const buttonCloseSeeMore = document.querySelector(buttonCloseSeeMoreCss);
    buttonCloseSeeMore.click();

    return {
      basicProfile,
      educationAll,
      experienceAll,
      urlLinkedin,
    };
  };

  const getProfile = async () => {
    const profile = await getContactProfile();
    await autoscrollToElement("body");
    console.log(profile);
  };

  getProfile();
}
