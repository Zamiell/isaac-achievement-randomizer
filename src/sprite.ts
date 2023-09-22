export function newSprite(anm2Path: string, pngPath?: string): Sprite {
  const sprite = Sprite();

  if (pngPath === undefined) {
    sprite.Load(anm2Path, true);
  } else {
    sprite.Load(anm2Path, false);
    sprite.ReplaceSpritesheet(0, pngPath);
    sprite.LoadGraphics();
  }

  sprite.SetFrame("Default", 0);

  return sprite;
}
