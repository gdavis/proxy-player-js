require 'rake'

module ProxyPlayerHelper
  ROOT_DIR        = File.expand_path(File.dirname(__FILE__))
  DEPLOY_DIR      = File.join(ROOT_DIR, 'deploy')
  DEPLOY_JS_DIR   = File.join(DEPLOY_DIR, 'javascripts')
  BUILD_DIR       = File.join(ROOT_DIR, 'build')
  SRC_DIR         = File.join(ROOT_DIR, 'src')
  AS_DIR          = File.join(SRC_DIR, 'as')
  JS_DIR          = File.join(SRC_DIR, 'js')
  VIDEO_DIR       = File.join(JS_DIR, 'video')

  def self.has_git?
    begin
      `git --version`
      return true
    rescue Error => e
      return false
    end
  end

  def self.require_git
    return if has_git?
    puts "\nPrototype requires Git in order to load its dependencies."
    puts "\nMake sure you've got Git installed and in your path."
    puts "\nFor more information, visit:\n\n"
    puts "  http://book.git-scm.com/2_installing_git.html"
    exit
  end

  def self.sprocketize(options = {})
    options = {
      :source_temp_dest => File.join(JS_DIR, 'ProxyPlayer-min.js'),
      :destination    => File.join(DEPLOY_JS_DIR, 'proxy-player.js'),
      :strip_comments => true,
      :source => File.join(VIDEO_DIR, 'ProxyPlayer.js'),
      :bundle => File.join(JS_DIR, 'video-bundle.js')
    }.merge(options)

    require_sprockets
    require_closure_compiler

    puts "\nMinions! Begin sprocketizing!\n"


    # concatenate the ProxyPlayer and its required files
    source_secretary = Sprockets::Secretary.new(
      :root           => ROOT_DIR,
      :load_path      => [JS_DIR],
      :source_files   => [options[:source]],
      :strip_comments => options[:strip_comments]
    )
    source_secretary.concatenation.save_to(options[:source_temp_dest])
    puts "\nPreparing ProxyPlayer and dependencies to: \n" + options[:source_temp_dest]


    # compile ProxyPlayer and its dependencies
    closure = Closure::Compiler.new(
            :compilation_level => 'SIMPLE_OPTIMIZATIONS',
            :jar_file => File.join(BUILD_DIR,'closure-compiler/compiler.jar')
    )
    puts "\nCompiling ProxyPlayer bundle at: \n" + options[:source_temp_dest]
    minified = closure.compile(File.open(options[:source_temp_dest], 'r'))
    File.open(options[:source_temp_dest], 'w') { |f| f.write(minified) }

    
    # finally, concatenate the minified ProxyPlayer code with the 3rd party libraries
    libs_secretary = Sprockets::Secretary.new(
      :root           => ROOT_DIR,
      :load_path      => [JS_DIR],
      :source_files   => [options[:bundle]],
      :strip_comments => options[:strip_comments]
    )

    puts "\nConcatenating 3rd party libararies with ProxyPlayer to: \n" + options[:destination]
    libs_secretary.concatenation.save_to(options[:destination])

    # remove the temporary minified file
    File.delete(options[:source_temp_dest])

    puts "\nWinner, winner, chicken dinner"
  end

  def self.require_closure_compiler
    require_submodule('closure-compiler', 'closure-compiler')
  end

  def self.require_sprockets
    require_submodule('Sprockets', 'sprockets')
  end

  def self.get_submodule(name, path)
    require_git
    puts "\nYou seem to be missing #{name}. Obtaining it via git...\n\n"

    Kernel.system("git submodule init")
    return true if Kernel.system("git submodule update vendor/#{path}")
    # If we got this far, something went wrong.
    puts "\nLooks like it didn't work. Try it manually:\n\n"
    puts "  $ git submodule init"
    puts "  $ git submodule update vendor/#{path}"
    false
  end

  def self.require_submodule(name, path)
    begin
      require path
    rescue LoadError => e
      # Wait until we notice that a submodule is missing before we bother the
      # user about installing git. (Maybe they brought all the files over
      # from a different machine.)
      missing_file = e.message.sub('no such file to load -- ', '')
      if missing_file == path
        # Missing a git submodule.
        retry if get_submodule(name, path)
      else
        # Missing a gem.
        puts "\nIt looks like #{name} is missing the '#{missing_file}' gem. Just run:\n\n"
        puts "  $ gem install #{missing_file}"
        puts "\nand you should be all set.\n\n"
      end
      exit
    end
  end

  def self.current_head
    `git show-ref --hash HEAD`.chomp[0..6]
  end
end

task :deploy do
  ProxyPlayerHelper.sprocketize
end