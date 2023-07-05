FROM ruby:2.5.3

RUN gem install bundler:1.17.3
RUN bundle install

RUN gem install docker-api \
  serverspec \
  jekyll
