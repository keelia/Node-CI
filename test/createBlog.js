//Temporary file to create a new blog post which can be used in Chrome

fetch('/api/blogs', {
  method: 'POST',
  //include cookies
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Title from API',
    content: 'Content from API',
  }),
});
//Past to Chrome to check it works
//then logout , past to chrome to make sure it fail

fetch('/api/blogs', {
  method: 'GET',
  //include cookies
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
});
