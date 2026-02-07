import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  subtitle: { fontSize: 18, marginBottom: 8, color: '#dc6300' },
  text: { fontSize: 12, marginBottom: 5, lineHeight: 1.5 },
});

// We use "export const" here to match your "import { RecipePDF }"
export const RecipePDF = ({ recipe }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.text}>{recipe.description}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.text}>• {ing.amount} {ing.item}</Text>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Instructions</Text>
        {recipe.instructions.map((step, i) => (
          <Text key={i} style={styles.text}>{step.step}. {step.instruction}</Text>
        ))}
      </View>
    </Page>
  </Document>
);