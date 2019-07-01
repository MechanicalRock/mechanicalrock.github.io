# mechanicalrock.github.io

Welcome!

Published blogs: https://mechanicalrock.github.io/

# Contributing

* Create a branch, using the format: `article/summary-title`
* Add your post under `_posts` using the format: `yyyy-mm-dd-summary-title.markdown`
* View your post locally (see below)
* Create a pull request - once approved it will be live.

References:
* http://jmcglone.com/guides/github-pages/
* https://kramdown.gettalong.org/syntax.html#code-spans

## Authoring Content

Start the Jekyll container:
`docker-compose up blogserver`

Rebuilding the Jekyll container:
If the container fails to start by throwing errors, you may need to rebuild the container by running the following:
`docker-compose build blogserver && docker-compose run blogserver`

Browse to the page: http://localhost:4000

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
