await Bootstrapper
  .Factory
  .CreateWeb(args)
  .AddSetting(Keys.Host, "hollowinsideofficial.com")
  .AddSetting(Keys.LinksUseHttps, true)
  .ConfigureEngine(engine => engine.Pipelines.Remove(nameof(Statiq.Web.Pipelines.Assets)))
  .ConfigureEngine(engine => engine.Pipelines.Add(nameof(Statiq.Web.Pipelines.Assets), new Pipeline()))
  .AddSetting(WebKeys.ExcludedPaths, new List<NormalizedPath>{new NormalizedPath("assets")})
  .AddProcess(ProcessTiming.Initialization, _ => new ProcessLauncher("yarn", "install", "--immutable"))
  .AddProcess(ProcessTiming.BeforeExecution, _ => new ProcessLauncher("gulp"))
  .RunAsync();
  