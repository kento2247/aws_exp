const POINTCARD_TEMPLATE_PATH = "./flex-pointcard-template.json";
let pointcard_info = {
  image: {
    url: "https://contents.blog.jicoman.info/image/aws.png",
    aspectRatio: "1:1",
    size: "4xl",
  },
  store_name: "Yagami bakery",
  point: 0,
  bounus: 0,
  bounus_max: 5,
  user_id: "sample",
  history: [
    { date: "2020/10/01", point: 1 },
    { date: "2020/10/02", point: 2 },
    { date: "2020/10/03", point: 3 },
  ],
};
function make_pointcard_replyEventObj(pointcard_info) {
  let template = require(POINTCARD_TEMPLATE_PATH);
  template.hero.url = pointcard_info.image.url;
  template.hero.size = pointcard_info.image.size;
  template.hero.aspectRatio = pointcard_info.image.aspectRatio;

  template.body.contents[0].text = pointcard_info.store_name;
  template.body.contents[1].contents[1].text = pointcard_info.point;
  const bounus_text = {
    type: "text",
    text: "Bonus: ",
  };
  const gold_star_icon = {
    type: "icon",
    size: "sm",
    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
  };
  const gray_star_icon = {
    type: "icon",
    size: "sm",
    url: "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png",
  };
  const scale_text = {
    type: "text",
    text: `${pointcard_info.bounus}/${pointcard_info.bounus_max}`,
    size: "sm",
    color: "#999999",
    margin: "md",
    flex: 0,
  };
  const bounus_contents = [bounus_text];
  for (let i = 0; i < pointcard_info.bounus_max; i++) {
    if (i < pointcard_info.bounus) {
      bounus_contents.push(gold_star_icon);
    } else {
      bounus_contents.push(gray_star_icon);
    }
  }
  bounus_contents.push(scale_text);
  // template.body.contents[2].contents = bounus_contents;
  template.body.contents[3].contents[1].text = pointcard_info.user_id;
  let history_contents = [
    template.body.contents[4].contents[0],
    template.body.contents[4].contents[1],
  ];
  for (let i = 0; i < pointcard_info.history.length; i++) {
    const history = pointcard_info.history[i];
    const history_content = {
      type: "box",
      layout: "baseline",
      contents: [
        {
          type: "text",
          text: history.date,
          margin: "none",
          size: "sm",
          align: "end",
        },
        {
          type: "text",
          text: history.point > 0 ? `+${history.point}` : history.point,
          margin: "none",
          size: "sm",
          align: "end",
        },
      ],
    };
    history_contents.push(history_content);
  }
  // template.body.contents[4].contents = history_contents;
  const replyEventObj = {
    type: "flex",
    altText: "This is a Flex Message",
    contents: template,
  };
  console.log(replyEventObj.contents.body.contents);
  return replyEventObj;
}

let result = make_pointcard_replyEventObj(pointcard_info);
console.log(result);
