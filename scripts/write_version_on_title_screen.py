import os

from PIL import Image, ImageFont, ImageDraw
from get_version_from_package_json import get_version_from_package_json
from utils import printf, PROJECT_DIRECTORY, SCRIPT_DIRECTORY

FONTS_DIRECTORY_PATH = os.path.join(SCRIPT_DIRECTORY, "fonts")
TITLE_FONT_PATH = os.path.join(FONTS_DIRECTORY_PATH, "jelly-crazies.ttf")
URL_FONT_PATH = os.path.join(FONTS_DIRECTORY_PATH, "vera.ttf")
MOD_DIRECTORY_PATH = os.path.join(PROJECT_DIRECTORY, "mod")
ENGLISH_RESOURCES_DIRECTORY_PATH = os.path.join(MOD_DIRECTORY_PATH, "resources")
MAIN_MENU_DIRECTORY_PATH = os.path.join(
    ENGLISH_RESOURCES_DIRECTORY_PATH, "gfx", "ui", "main menu"
)
TITLE_MENU_TEMPLATE_PATH = os.path.join(
    MAIN_MENU_DIRECTORY_PATH, "titlemenu-template.png"
)
TITLE_MENU_FILE_1 = "titlemenu.png"  # For the normal title screen.
TITLE_MENU_FILE_2 = "titlemenu_2.png"  # For the "Stop Playing!" title screen.

LARGE_FONT = ImageFont.truetype(TITLE_FONT_PATH, 9)
SMALL_FONT = ImageFont.truetype(TITLE_FONT_PATH, 6)
URL_FONT = ImageFont.truetype(URL_FONT_PATH, 11)
ALPHA_FONT = ImageFont.truetype(URL_FONT_PATH, 14)
COLOR = (67, 93, 145)


def main():
    version = get_version_from_package_json()
    write_version(version)


def write_version(version):
    title_image = Image.open(TITLE_MENU_TEMPLATE_PATH)
    title_draw = ImageDraw.Draw(title_image)

    # Get the dimensions of how big the text will be.
    combined_text = "V" + version
    width, height = title_draw.textsize(combined_text, font=LARGE_FONT)

    # Draw the mod title.
    title_x = 415
    title_y = 210
    width, height = title_draw.textsize("Achievement", font=URL_FONT)
    title_draw.text((title_x - width / 2, title_y), "Achievement", COLOR, font=URL_FONT)
    width, height = title_draw.textsize("Randomizer", font=URL_FONT)
    title_draw.text(
        (title_x - width / 2, title_y + 10), "Randomizer", COLOR, font=URL_FONT
    )

    # Draw the version.
    version_x = 420
    version_y = 240
    title_draw.text((version_x - width / 2, version_y), "V", COLOR, font=SMALL_FONT)
    title_draw.text(
        (version_x + 10 - width / 2, version_y - 6), version, COLOR, font=LARGE_FONT
    )

    # Draw the beta text.
    beta_x = 415
    beta_y = 255
    width, height = title_draw.textsize("ALPHA", font=ALPHA_FONT)
    title_draw.text((beta_x - width / 2, beta_y), "ALPHA", COLOR, font=ALPHA_FONT)

    # Write the finished title screen.
    title_menu_file_1_path = os.path.join(MAIN_MENU_DIRECTORY_PATH, TITLE_MENU_FILE_1)
    title_image.save(title_menu_file_1_path)

    title_menu_file_2_path = os.path.join(MAIN_MENU_DIRECTORY_PATH, TITLE_MENU_FILE_2)
    title_image.save(title_menu_file_2_path)

    printf("The title screen image was updated to version: {}".format(version))


if __name__ == "__main__":
    main()
