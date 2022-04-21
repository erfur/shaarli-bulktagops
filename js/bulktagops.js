/**
 * Bulk actions
 */

const Jws = require('jws')

var bulkTagOps = new function () {

  // necessary objects
  this.searchTags = document.querySelector('.searchtags');
  this.bar = document.querySelector('.bulktaginput');

  // snatch tags from the search bar
  this.bar.setAttribute('data-list', this.searchTags.getAttribute('data-list'));

  // get the api key from the bar's attributes
  this.apiKey = this.bar.getAttribute('key');

  // add event listener to all checkboxes
  this.linkCheckboxes = document.querySelectorAll('.link-checkbox');
  [...this.linkCheckboxes].forEach(async (checkbox) => {
    // multiple event listeners can be defined
    checkbox.addEventListener('change', () => {
      const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
      const count = [...linkCheckedCheckboxes].length;
      this.updateBar();
    });
  });

  // add keydown event listener to the tag bar
  this.bar.addEventListener('keydown', (k) => {
    // TODO handle enter and set entered/deleted tags
    if (event.key === "Enter") {
      event.preventDefault();
      window.confirm("Do you want to update tags?") && this.setTags();
    }
  })

  // generate jwt token using Jws
  this.generateToken = function() {
      return Jws.sign({
          header: {
            alg: 'HS512',
            typ: 'JWT' },
          payload: { iat: Math.floor(Date.now() / 1000) },
          secret: this.apiKey
        }
      ).toString();
  }

  // TODO optimize
  this.updateBar = async function () {
    var tags;
    var linkJson;
    var first = true;
    // clear the bar
    this.bar.value = "";

    const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
    console.log("Checked links: " + [...linkCheckedCheckboxes].map((i) => i.value).toString());

    await Promise.all([...linkCheckedCheckboxes].map((link) => {
      // retreive each link's tags using REST API
      fetch(window.location.origin + '/api/v1/links/' + link.value.toString(), {
        headers: {'Authorization': 'Bearer ' + this.generateToken()}
      })
      .then(async (response) => {
        linkJson = await response.json(); //extract JSON from the http response

        if (first) {
          tags = new Set(linkJson.tags);
          first = false;
        }

        // reduce the tags to only common ones
        tags = new Set(linkJson.tags.filter(x => tags.has(x)));

        // update the bar
        this.bar.value = [...tags].join(' ');
      });
    }));

    if (linkCheckedCheckboxes.size == 0) {
      this.bar.value = '';
    }
  }

  // run it to initialize the bar in case of page reload
  this.updateBar();

  this.setTags = async function () {
    const tags = this.bar.value.split(" ");
    const linkCheckedCheckboxes = document.querySelectorAll('.link-checkbox:checked');
    [...linkCheckedCheckboxes].forEach((link) => {

      fetch(window.location.origin + '/api/v1/links/' + link.value.toString(), {
          headers: {'Authorization': 'Bearer ' + this.generateToken()}
      })
      .then(async (response) => {
        linkJson = await response.json(); //extract JSON from the http response
        // console.log(linkJson);
        [...tags].forEach((tag) => {
          // remove tags that has a '-' prefix
          if (tag.charAt(0) == '-' && linkJson.tags.includes(tag.substring(1)))
            linkJson.tags = linkJson.tags.filter((e) => e != tag.substring(1));
          // otherwise add if it doesnt already exist in the array
          else if (!linkJson.tags.includes(tag))
            linkJson.tags.push(tag);
        });

        // update the link
        fetch(window.location.origin + '/api/v1/links/' + link.value.toString(), {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.generateToken(),
            },
            body: JSON.stringify(linkJson),
        })
      });
    });
  }
}
