import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import * as HeroIcons20Solid from "@heroicons/react/20/solid";
import * as HeroIcons24Solid from "@heroicons/react/24/solid";
import * as HeroIcons24Outline from "@heroicons/react/24/outline";

import CommandPalette, { filterItems } from "react-cmdk";

const initialOpenState = false;
instance.data.isOpen = initialOpenState;

function getTarget() {
  return instance.canvas.get(0);
}


//create list of icon components
const iconNames = [
  ...Object.keys(HeroIcons20Solid),
  ...Object.keys(HeroIcons24Solid),
  ...Object.keys(HeroIcons24Outline),
];

const validIconComponents = iconNames.filter((component) =>
  component.endsWith("Icon")
);
// main component
const CommandPalettePlugin = (props) => {
  const [open, setOpen] = useState(initialOpenState);
  const raw_pages = props.raw_pages;
  const fireCommand = props.fireCommand;
  const freeSearchLabel = props.freeSearchLabel;
  const searchPlaceholder = props.searchPlaceholder;
  const [search, setSearch] = useState("");
  const initialPageState = raw_pages[0].id;
  const [pageState, setPageState] = useState(initialPageState);
  const [selectedItem, setSelectedItem] = useState(0);

  const setPageStateWrapper = (page_id) => {
    setSearch("");
    setPageState(page_id);
    const input = document.getElementById("command-palette-search-input");
    if (input) {
      input.focus();
    }
  };

  function closeCommandPalette() {
    setOpen(false);
    closeBubbleStuffWrapper();
    setSearch("");
    setPageState(initialPageState);
    setSelectedItem(0);
  }

  raw_pages.forEach((page) => {
    page.lists.forEach((list) => {
      list.items.forEach(
        (item) =>
          (item.onClick = () => {
            if (item.closeOnSelect) {
              fireCommand(item.children, item.type, null);
              closeCommandPalette();
            } else if (item.pageOnSelect) {
              setPageStateWrapper(item.pageOnSelect);
            } else {
              const input = document.getElementById(
                "command-palette-search-input"
              );
              if (input) {
                input.focus();
              }
              setSearch(item.children + " → ");
            }
          })
      );
    });
  });

  // arrange lists for filtering
  let raw_lists = [];
  raw_pages.forEach(
    (page) =>
      (raw_lists = raw_lists.concat(
        page.lists.map((list) => ({
          ...list,
          page_id: turnNameIntoId(page.name),
        }))
      ))
  );

  const filteredItems = filterItems(raw_lists, search);

  const currentPageFilteredItems = filteredItems.filter(
    (list) => list.page_id === pageState
  );

  // check if search includes any of searchCommands from all items
  let result = null;
  raw_pages.some((page) => {
    return page.lists.some((list) => {
      return list.items.some((item) => {
        if (search.includes(item.children + " →")) {
          result = item;
          return true;
        }
      });
    });
  });

  // manage opening/closing with keys

  useEffect(() => {
    function handleKeyDown(e) {
      if (((e.metaKey || e.altKey) && (e.key === "k" || e.code === "KeyK")) || e.key === "§") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
        openBubbleStuffWrapper();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeCommandPalette();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <CommandPalette
      selected={selectedItem}
      onChangeSelected={setSelectedItem}
      onChangeSearch={setSearch}
      onChangeOpen={setOpen}
      search={search}
      placeholder={searchPlaceholder}
      isOpen={open}
      page={pageState}>
      {raw_pages.map((page) => {
        let page_index = -1;
        return (
          <CommandPalette.Page
            id={page.id}
            key={page.id}
            searchPrefix={page.prefix ? [page.prefix] : null}
            onEscape={() => {
              setPageState(initialPageState);
            }}>
            {result && (
              <CommandPalette.List heading="">
                <CommandPalette.ListItem
                  id={result.id}
                  children={result.children}
                  icon={result.icon}
                  closeOnSelect={true}
                  onClick={() => {
                    fireCommand(
                      search.split("→")[0],
                      result.type,
                      search.split("→")[1]
                    );
                    closeCommandPalette();
                  }}></CommandPalette.ListItem>
              </CommandPalette.List>
            )}
            {!!(
              filteredItems.length &&
              currentPageFilteredItems.length &&
              !result
            ) &&
              currentPageFilteredItems.map((list) => (
                <CommandPalette.List
                  id={list.id}
                  heading={list.heading}
                  key={list.id}>
                  {list.items.map((item) => {
                    page_index += 1;
                    return (
                      <CommandPalette.ListItem
                        key={item.id}
                        id={item.id}
                        // children={item.children}
                        icon={item.icon}
                        type={item.type}
                        onClick={item.onClick}
                        closeOnSelect={item.closeOnSelect}
                        index={page_index}>
                        {item.children}
                        {item.type && (
                          <div
                            className="text-gray-500 text-sm"
                            style={{ marginLeft: "auto" }}>
                            {item.type}
                          </div>
                        )}
                      </CommandPalette.ListItem>
                    );
                  })}
                </CommandPalette.List>
              ))}
            {!filteredItems.length && !result && (
              <CommandPalette.FreeSearchAction
                label={freeSearchLabel}
                onClick={() => {
                  publish_state();
                  fireCommand(null, null, search);
                  closeCommandPalette();
                }}
              />
            )}
          </CommandPalette.Page>
        );
      })}
    </CommandPalette>
  );
};

// auxiliary functions and bubble wrappers
function fireCommand(name, type, args) {
  publish_state("executed_command_name", name);
  publish_state("executed_command_type", type);
  publish_state("executed_command_args", args);
  trigger_event("executed_command");
}

function closeBubbleStuffWrapper() {
  if (instance.data.isOpen) {
    publish_state("is_open", false);
    trigger_event("closed");
    instance.data.isOpen = false;
  }
}

function openBubbleStuffWrapper() {
  if (!instance.data.isOpen) {
    publish_state("is_open", true);
    trigger_event("opened");
    instance.data.isOpen = true;
  }
}

function instanceDataGet(name) {
  return instance.data[name];
}

function publish_state(name, value) {
  instance.publishState(name, value);
}

function trigger_event(name) {
  instance.triggerEvent(name);
}

const turnNameIntoId = (str) => {
  if (str) return str.toLowerCase().split(" ").join("-");
  return null;
};
function hyphenToPascalCase(str) {
  return str
    .split("-")
    .map((word) => {
      if (/^\d/.test(word)) {
        return word.toUpperCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    })
    .join("");
}

function checkIconName(validIconComponentNames, iconName) {
  if (validIconComponentNames.includes(iconName)) {
    return iconName;
  } else if (validIconComponentNames.includes(iconName + "Icon")) {
    return iconName + "Icon";
  } else if (
    validIconComponentNames.includes(hyphenToPascalCase(iconName) + "Icon")
  ) {
    return hyphenToPascalCase(iconName) + "Icon";
  } else {
    return "";
  }
}

const freeSearchLabel = properties.free_search_label;
const searchPlaceholder = properties.search_placeholder;

// json parsing
let raw_pages;
let json_error_flag = false;
try {
  const raw_elements = JSON.parse(properties.json_data);

  raw_pages = raw_elements.pages.map((page, page_index) => ({
    id: turnNameIntoId(page.name),
    name: page.name,
    prefix: page.prefix,
    lists: page.lists.map((list, list_index) => ({
      id: turnNameIntoId(list.name),
      heading: list.name,
      items: list.items.map((item, item_index) => {
        return {
          id:
            turnNameIntoId(item.name) ||
            `ìtem-${page_index}-${list_index}-${item_index}`,
          children: item.name,
          icon: checkIconName(validIconComponents, item.icon),
          closeOnSelect: item.closeOnSelect !== false,
          pageOnSelect: item.pageOnSelect,
          type: item.type,
          onClick: null,
          list: list.name,
          page: page.name,
        };
      }),
    })),
  }));
} catch (error) {
  console.error("Error parsing JSON data: ", error.message);
  json_error_flag = true;
}

if (!json_error_flag) {
  instance.publishState("current_json_config", properties.json_data);
  //styles

  let commandPaletteStylesheet = document.createElement("style");
  commandPaletteStylesheet.innerHTML = `.command-palette {
    font-family: ${properties.bubble.font_face().split(":::")[0]};
    font-weight: ${properties.bubble.font_face().split(":::")[1]};
    color: ${properties.bubble.font_color()}; 
    font-size: ${properties.bubble.font_size()}px;
    --cmdk-secondary-color: ${properties.secondary_text_color};
    --cmdk-bg-color: ${properties.background_color};
    --cmdk-highlighted-color: ${properties.highlighted_item_color};
    --cmdk-border-color: ${properties.border_color};
  }
  
  .command-palette div[id^='headlessui-dialog-panel'] {
    background-color: var(--cmdk-bg-color);
  }
  .command-palette-content > div:first-child {
    background-color: ${properties.overlay_color};
    opacity: ${
      properties.overlay_transparency > 1
        ? 1
        : properties.overlay_transparency < 0
        ? 0
        : properties.overlay_transparency
    };
  }`;

  if (
    !instance.data.initiated ||
    instance.data.json_data !== properties.json_data
  ) {
    instance.data.json_data = properties.json_data;

    if (instance.data.initiated) {
      instance.data.root.unmount();
    }

    instance.data.root = createRoot(getTarget());

    document
      .getElementsByTagName("head")[0]
      .appendChild(commandPaletteStylesheet);

    instance.data.root.render(
      React.createElement(CommandPalettePlugin, {
        raw_pages,
        fireCommand,
        searchPlaceholder,
        freeSearchLabel,
      })
    );
    instance.data.initiated = true;
  }
}
