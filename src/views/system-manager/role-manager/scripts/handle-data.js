export function handleMenuList(menuList) {
  if (!menuList || !menuList.length) return [];
  const handleList = (list, parentNode) => {
    list.forEach(item => {
      item.parentId != null && parentNode != null && (item.parentNode = parentNode); // 添加父节点
      if (item.children && item.children.length) {
        handleList(item.children, item);
      }
    });
  };
  handleList(menuList);
  return menuList;
}
