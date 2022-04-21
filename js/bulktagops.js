/**
 * Bulk actions
 */

const Jws = require('jws')

const linkCheckboxes = document.querySelectorAll('.link-checkbox');
[...linkCheckboxes].forEach(async (checkbox) => {
  // multiple event listeners can be defined
  checkbox.addEventListener('change', () => {
    const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
    const count = [...linkCheckedCheckboxes].length;
    // console.log("Number of checked links: " + count.toString())
    updateBar();
  });

});

const generateToken = () => {
    return Jws.sign({
        header: {
          alg: 'HS512',
          typ: 'JWT' },
        payload: { iat: Math.floor(Date.now() / 1000) },
        secret: bar.getAttribute('key')
      }
    ).toString();
}

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
    // retreive each link's tags using REST API
    fetch(window.location.origin + '/api/v1/links/' + link.value.toString(),
      {
        headers: {
          'Authorization': 'Bearer ' + generateToken(),
        }
      }
    )
    // TODO study async, see if this usage is correct
    .then(async (response) => {
      linkJson = await response.json(); //extract JSON from the http response
      // console.log(linkJson);

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

// run it to initialize the bar in case of page reload
updateBar();

// snatch tags from the search bar
const searchTags = document.querySelector('.searchtags');
bar.setAttribute('data-list', searchTags.getAttribute('data-list'));

const setTags = () => {
  const tags = bar.value.split(" ");
  const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
  [...linkCheckedCheckboxes].forEach((link) => {
    fetch(window.location.origin + '/api/v1/links/' + link.value.toString(),
      {
        headers: {
          'Authorization': 'Bearer ' + generateToken(),
        }
      }
    )
    // TODO study async, see if this usage is correct
    .then(async (response) => {
      linkJson = await response.json(); //extract JSON from the http response
      // console.log(linkJson);
      [...tags].forEach((tag) => {
        if (tag.charAt(0) == '-' && linkJson.tags.includes(tag.substring(1)))
          linkJson.tags = linkJson.tags.filter((e) => e != tag.substring(1));
        else if (!linkJson.tags.includes(tag))
          linkJson.tags.push(tag);
      });

      fetch(window.location.origin + '/api/v1/links/' + link.value.toString(),
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + generateToken(),
          },
          body: JSON.stringify(linkJson),
        }
      ).then(res => {
        console.log("Request complete! response:", res);
      });
    });
  });
}

bar.addEventListener('keydown', (k) => {
  // TODO handle enter and set entered/deleted tags
  if (event.key === "Enter") {
    event.preventDefault();
    setTags();
    alert("Done!")
  }
})
