/**
 * Bulk actions
 */

const Jws = require('jws')

var currCommonTags = [];
const linkCheckboxes = document.querySelectorAll('.link-checkbox');
[...linkCheckboxes].forEach(async (checkbox) => {
  checkbox.style.display = 'inline-block';

  // multiple event listeners can be defined
  checkbox.addEventListener('change', () => {
    const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
    const count = [...linkCheckedCheckboxes].length;
    // console.log("Number of checked links: " + count.toString())
    updateBar();
  });

});

const bar = document.querySelector('.bulktaginput')
const updateBar = () => {
  var tags;
  var linkJson;
  var first = true;
  // clear the bar
  bar.value = "";

  const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
  // console.log("Checked links: " + [...linkCheckedCheckboxes].map((i) => i.value).toString());
  [...linkCheckedCheckboxes].forEach((link) => {
    const token = Jws.sign({
        header: {
          alg: 'HS512',
          typ: 'JWT' },
        payload: { iat: Math.floor(Date.now() / 1000) },
        // TODO get this value from backend somehow
        secret: "f150c910edb3"
      }
    );
    // retreive each link's tags using REST API
    // TODO get the base path from backend
    fetch('http://localhost/api/v1/links/' + link.value.toString(),
      {
        headers: {
          'Authorization': 'Bearer ' + token.toString(),
        }
      }
    )
    // TODO study async, see if this usage is correct
    .then(async (response) => {
      linkJson = await response.json(); //extract JSON from the http response
      console.log(linkJson);

      if (first) {
        tags = new Set(linkJson.tags);
        first = false;
      }

      // reduce the tags to only common ones
      tags = new Set(linkJson.tags.filter(x => tags.has(x)));

      // update the bar
      bar.value = [...tags].join(' ');
    });

  });
}

bar.addEventListener('keydown', (k) => {
  if (event.key === "Enter") {
    event.preventDefault();
  }
})
