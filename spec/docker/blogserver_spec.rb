require 'spec_helper'
require 'docker'

describe "Blog Server" do

  # $stderr.reopen("output/blogserver.log", "w")

  before(:all) do
    image = Docker::Image.build_from_dir('.')do |v|
      if (log = JSON.parse(v)) && log.has_key?("stream")
        $stderr.puts log["stream"]
      end
    end

    @container = image.run()
    set :os, family: :debian
    set :backend, :docker
    set :docker_container, @container.id
    # wait for the container to start
    sleep 10
    # wait_for_open_port 4000, 10


    # set :os, family: :debian
    # set :backend, :docker
    # set :docker_image, image.id

  end

  after(:all) do
     @container.kill
     @container.delete(:force => true)
  end

  describe "Jekyll Server" do
    describe port('4000') do
      it { should be_listening }
    end

    describe command('curl http://localhost:4000') do
      its(:stdout) { should include '<title>Mechanical Rock Blogs</title>' }
    end
  end


end
