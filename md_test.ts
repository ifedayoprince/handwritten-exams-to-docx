import { writeFile } from "fs/promises";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import remarkDocx from '@/md-to-docx'

// const markdown = `
// 1. Which of the following organelles is common to both plants and animal cells?
//   - Cellulose cell wall
//   - Chlorophyll
//   - Cell membrane
//   - Large vacuole

// 2. The level of organization of life in Euglena is
//   - Tissue
//   - Cell
//   - Organ
//   - System
// `;
const markdown = `
**Section A**

Answer all questions in this section

1. Which of the following organelles is common to both plants and animal cells?
  - Cellulose cell wall
  - Chlorophyll
  - Cell membrane
  - Large vacuole

2. The level of organization of life in Euglena is
  - Tissue
  - Cell
  - Organ
  - System

3. Which of the following factors is not necessary for photosynthesis?
  - Water
  - Carbon (IV) oxide
  - Mineral
  - Sunlight

4. Autotrophic nutrition is a process where an organism obtains food
  - by utilizing its stored energy
  - by synthesizing simple substances using energy
  - from other organisms in exchange for some products
  - in a synthesized form from other living organisms

5. Which of the following statements about living things is correct?
  - Animals respire using carbon (IV) oxide as raw material
  - Growth in plant is limited after some time
  - Most plants respond to stimulus slowly
  - Higher animals can reproduce asexually

6. Organ level of organization in living things is found in
  - Water (leaf plant)
  - Virus particle
  - Kidney
  - Spermatozoon

7. The process that brings about the shrinking of a spinach cell when placed in a strong solution is
  - Osmosis
  - Autolysis
  - Plasmolysis
  - Diffusion

8. In which of the following structures is simple sugar produced?
  - Vacuole
  - Cytoplasm
  - Chloroplast
  - Cell wall

9. An evidence of the occurrence of photosynthesis in an experiment is the
  - Release of carbon (IV) oxide
  - Release of oxygen
  - Formation of water molecules
  - Formation and release of fructose

10. Producers are normally sustained by energy from
  - Green plant
  - Carbohydrate
  - Consumers
  - Sunlight

11. The type of nutrition in which organisms take in solid organic materials into their body is
  - Holozoic
  - Symbiotic
  - Saprophytic
  - Parasitic

12. Fishes survive in water mainly because they possess
  - Streamlined body
  - Scales
  - Paired fins
  - Gills

13. Growth in animals differs from that in plants because growth in plants is intercalary
  - Animals is apical
  - Plants is from within
  - Plants is indefinite

14. The food substance that would produce the highest amount of energy is
  - Glucose
  - Fat
  - Amino-acid
  - Protein

15. Sunlight is the major source of
  - Vitamin A
  - Vitamin C
  - Vitamin B
  - Vitamin D

16. An organic catalyst usually proteinaceous in nature which promotes or speeds-up chemical changes in living cells but are not themselves used up in the process are
  - Dentition
  - Enzymes
  - Hormones
  - Glands

17. The skeleton found on the outside or external part of the body of some animals is called
  - Hydrostatic skeleton
  - Exoskeleton
  - Endoskeleton
  - Cartilage

18. It is an elastic bands of tissue which holds two bones together at a joint
  - Tendons
  - Ligaments
  - Articular cartilage

19. Which of the following is not a type of supporting tissues in plants?
  - Collenchyma
  - Sclerenchyma
  - Xylem
  - Epidermis

20. One of the following tissues in plants conduct water and dissolved mineral salts from root to the leaves
  - Phloem tissue
  - Sclerenchyma tissue
  - Xylem tissue
  - Parenchyma tissue

**Section B: Theory**

Answer four questions from this section

1a. What is supporting tissues in plants?  
1b. Give five supporting tissues in plants and one main function of each

2a. Mention the five groups of bones of the vertebral column and where they are found in the body  
2b. Define skeleton

3a. Explain the three types of skeleton with examples  
3b. Define cellular respiration

4a. Discuss on the two types of plant minerals with examples  
4b. What is photosynthesis?

5a. Define the following: Haemolysis, Turgidity, Plasmolysis and Osmosis  
5b. Give four differences between plant and animal cells

(Osmosis)

[END]`;

async function main() {
  const docx = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkDocx)
    .process(markdown);
  const docxBuffer = await docx.result;

  await writeFile("./output.docx", docxBuffer as Buffer);
  console.log("done")
}
main()