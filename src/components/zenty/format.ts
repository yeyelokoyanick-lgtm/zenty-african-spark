export const fcfa = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
